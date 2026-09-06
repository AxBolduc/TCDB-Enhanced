export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryCardModel = {
  href: string;
  front: GalleryImage;
  back?: GalleryImage;
  title: string;
  price: string;
};
