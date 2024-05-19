type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  alt: string;
};

export function Image(props: ImageProps) {
  return (
    <img
      {...props}
      alt={props.alt || ''}
      style={{
        display: 'block',
        objectFit: 'cover',
        maxWidth: '100%',
        height: 'auto',
        backgroundColor: 'var(--gray-5)',
        ...props.style,
      }}
    />
  );
}
