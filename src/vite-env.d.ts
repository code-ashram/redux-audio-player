/// <reference types="vite/client" />

declare module '*.svg?react' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}

// You might also want declarations for regular SVG imports (as URL) if you use them
declare module '*.svg' {
  const content: string;
  export default content;
}

svgr({
  // svgr options: https://react-svgr.com/docs/options/
  svgrOptions: {
    // ...
  },

  // esbuild options, to transform jsx to js
  esbuildOptions: {
    // ...
  },

  // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
  include: "**/*.svg?react",

  //  A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should ignore. By default no files are ignored.
  exclude: "",
});
