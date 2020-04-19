import Router from 'next/router';
import React, { Component, FunctionComponent, useEffect } from 'react';

// Based on https://github.com/zeit/next.js/discussions/11281#discussioncomment-2384

interface Redirect {
  href: string,
  asPath: string,
  permanent: boolean,
}

export const BrowserRedirect: FunctionComponent<Redirect> = ({href, asPath}) => {
    useEffect(() => {
        console.log(href, asPath)
        Router.push(href, asPath); // Router.replace might be better here? not sure
    })

    return <p>Redirecting...</p>;
};

export const serverRedirect = ({req, res}, redirect: Redirect) => {
  const { referer } = req.headers; // if there's no referer then it was a server request
  const { asPath, permanent } = redirect;

  if (!referer) {
    res.setHeader('Location', asPath);
    res.statusCode = permanent ? 301 : 307;
  }

   return { props: redirect };
};