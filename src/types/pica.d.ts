declare module 'pica' {
  interface PicaResizeOptions {
    alpha?: boolean;
    quality?: number;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
    cancelToken?: Promise<unknown>;
  }

  interface PicaInstance {
    resize(
      from: HTMLImageElement | HTMLCanvasElement,
      to: HTMLCanvasElement,
      options?: PicaResizeOptions
    ): Promise<HTMLCanvasElement>;
    toBlob(
      canvas: HTMLCanvasElement,
      type: string,
      quality?: number
    ): Promise<Blob>;
  }

  interface PicaConstructor {
    new (options?: { tile?: number; features?: string[]; idle?: number; concurrency?: number }): PicaInstance;
    (): PicaInstance;
  }

  const Pica: PicaConstructor;
  export default Pica;
}
