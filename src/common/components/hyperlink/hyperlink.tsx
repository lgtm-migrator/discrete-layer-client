import React from 'react';

import './hyperlink.css';

export const Hyperlink: React.FC<{ url: string, token?: string }> = ({ url, token }): JSX.Element => {
  return <a href={`${url}${token ?? ''}`} target="_blank" rel="noopener noreferrer" className='url'>{url}</a>;
};
