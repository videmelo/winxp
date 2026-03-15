import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import inlineSvg from 'postcss-inline-svg';

export default {
   plugins: [
      postcssImport(),
      postcssNested(),
      inlineSvg({
         paths: ['src'],
      }),
   ],
};
