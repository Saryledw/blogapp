// custom-loader.ts
import { ImageLoaderProps } from 'next/image';

const customLoader = ({ src }: ImageLoaderProps): string => {
  return src;
};

export default customLoader;
