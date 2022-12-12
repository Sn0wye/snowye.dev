import { styled } from '../../../stitches.config';

export const PostMain = styled('main', {
  '@bp2': { padding: '$navHeightDesktop 0' },
  padding: '$navHeightMobile 0',
  overflow: 'hidden',
  flex: '1 1'
});

export const Post = styled('main', {
  overflow: 'hidden',
  flex: '1 1'
});

export const PostContainer = styled('div', {
  margin: '0 auto',
  maxWidth: '760px',
  padding: '0 1.25rem'
});

export const PostContent = styled('div', {
  fontSize: '1rem',
  lineHeight: '2rem',
  color: '$secondary',
  background: '$background',
  position: 'relative',
  zIndex: 1,
  height: '100%',
  padding: '1.25rem 0',
  '& .iframe-wrap': {
    height: '0',
    marginBottom: '1.25rem',
    overflow: 'hidden',
    paddingBottom: '56.25%',
    paddingTop: '1.875rem',
    position: 'relative'
  },
  '& .iframe-wrap iframe': {
    border: '0',
    height: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '100%'
  },
  '& .post-image-caption': {
    color: '$secondary',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '0.875rem'
  },
  '& .post-image-full': {
    margin: '1.25rem 0 0',
    maxWidth: 'initial',
    width: '70vw',
    '@bp2': {
      marginLeft: 'calc(-1 * (70vw - 760px) / 2)'
    },
    '@bp4': {
      marginLeft: 0
    }
  },
  '& .side-by-side': {
    display: 'flex',
    width: '90vw',
    margin: '2.5rem 0',
    flexDirection: 'row',
    '@bp2': {
      marginLeft: 'calc(-1 * (90vw - 760px) / 2)'
    },
    '@bp4': {
      marginLeft: 0,
      flexDirection: 'column'
    }
  },
  '& .side-by-side-img': {
    minWidth: '50%',
    '@bp2': {
      minWidth: '100%'
    },
    '@bp4': {
      // marginLeft: 0,
    }
  },
  '& .side-by-side-caption': {
    color: '$secondary',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '0.875rem',
    marginTop: -30
  }
});
