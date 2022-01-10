const fs = require('fs');
const url = require('url');
const path = require('path');
const exec = require('child_process').execFile;

let confdUrl =
  'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-windows-amd64.exe';
let confdExeExtension = '.exe';
const linuxConfdUrl =
  'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-linux-amd64';
const darwinConfdUrl =
  'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-darwin-amd64';

if (process.platform === 'linux') {
  confdUrl = linuxConfdUrl;
  confdExeExtension = '';
}

if (process.platform === 'darwin') {
  confdUrl = darwinConfdUrl;
  confdExeExtension = '';
}

const confdBasePath = __dirname;
const confdDevBasePath = path.join(confdBasePath, 'dev');
const confdPath = path.join(confdBasePath, `confd${confdExeExtension}`);

const confdTmplRelPath = 'production.tmpl';
const confdConfigPath = path.join(confdBasePath, 'production.toml');
const confdTmplPath = path.join(confdBasePath, confdTmplRelPath);
const devTmplPath = path.join(confdDevBasePath, '/templates/' + confdTmplRelPath);
const devConfigPath = path.join(confdDevBasePath, 'conf.d/development.toml');

const indexTmplRelPath = 'index.tmpl';
const indexConfigPath = path.join(confdBasePath, 'index.toml');
const indexTmplPath = path.join(confdBasePath, indexTmplRelPath);
const devIndexTmplPath = path.join(confdDevBasePath, '/templates/' + indexTmplRelPath);
const devIndexConfigPath = path.join(confdDevBasePath, 'conf.d/index.toml');

const download = (uri, filename) => {
  console.log(`Downloading ${filename} from ${uri}`);
  const protocol = url.parse(uri).protocol.slice(0, -1);

  return new Promise((resolve, reject) => {
    const onError = e => {
      fs.unlink(filename);
      reject(e);
    };

    require(protocol)
      .get(uri, function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const fileStream = fs.createWriteStream(filename, { mode: 0o755 });
          fileStream.on('error', onError);
          fileStream.on('close', resolve);
          response.pipe(fileStream);
        } else if (response.headers.location) {
          resolve(download(response.headers.location, filename));
        } else {
          reject(new Error(response.statusCode + ' ' + response.statusMessage));
        }
      })
      .on('error', onError);
  });
};

const downloadIfNotExists = (uri, filename) => {
  console.log(`Checking if ${filename} exists.`);
  return new Promise(resolve => {
    if (fs.existsSync(filename)) {
      console.log(`${filename} exists, proceeding to the next stage.`);
      resolve();
      return;
    }

    console.log(`${filename} does not exist.`);
    resolve(download(uri, filename));
  });
};

const copyFile = (src, dest, mutationFunc) => {
  return new Promise((resolve, reject) => {
    fs.readFile(src, 'utf8', function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      const result = mutationFunc ? mutationFunc(data) : data;

      fs.writeFile(dest, result, 'utf8', function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

const createDirIfNotExists = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const createDevConfdConfigFile = (env, isInDocker) => {
  createDirIfNotExists(confdDevBasePath);
  createDirIfNotExists(path.join(confdDevBasePath, 'conf.d'));
  createDirIfNotExists(path.join(confdDevBasePath, 'templates'));

  if (!env) {
    env = 'default';
  }
  console.log('Creating a development toml and tmpl files.');
  const tmplCopy = copyFile(confdTmplPath, devTmplPath);
  const tomlCopy = copyFile(confdConfigPath, devConfigPath, data => {
    const target = 'dest = "' + path.join(confdBasePath, '..', 'html') + '/'; 
    return !isInDocker ? data : data.replace('dest = "public/', target);
  });
  const indexTmplCopy = copyFile(indexTmplPath, devIndexTmplPath);
  const indexTomlCopy = copyFile(indexConfigPath, devIndexConfigPath, data => {
    const target = 'dest = "' + path.join(confdBasePath, '..', 'html') + '/'; 
    return !isInDocker ? data : data.replace('dest = "public/', target);
  });

  return Promise.all([tmplCopy, tomlCopy]);
};

const runConfd = () => {
  console.log('Running confd');
  exec(
    `${confdPath}`,
    ['-backend', 'env', '-onetime', '-confdir', confdDevBasePath],
    (error, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      if (error !== null) {
        throw new Error(`exec error: ${error}`);
      }
    }
  );
};

const createTargetDir = () => {
  createDirIfNotExists('config');
};

const help = () => {
  console.log('usage: "node <path to this script> [options]\n');
  console.log('options:');
  console.log(
    '--environment <environment name>			generate js config file instead of default.'
  );
  console.log(
    '--indocker			generate js config file in different location.'
  );
  console.log('--help			shows this help page.');
  console.log();
  process.exit(0);
};
const main = () => {
  if (process.argv.indexOf('--help') != -1) {
    help();
  }
  const envIdx = process.argv.indexOf('--environment');
  const isInDocker = process.argv.indexOf('--indocker') !== -1;
  const env = envIdx !== -1 ? process.argv[envIdx + 1] : null;
  downloadIfNotExists(confdUrl, confdPath)
    .then(() => createDevConfdConfigFile(env, isInDocker))
    // .then(createTargetDir())
    .then(() => runConfd())
    .catch(err => {
      console.error('Failed to generate the configuration');
      console.error(err);
      process.exit(1);
    });
};

main();
