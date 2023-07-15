import Lottie from 'lottie-react';
import lottieAnimation from '../../public/static/icons/404.json';
import { styled } from '../../stitches.config';
import { Layout } from '../components/Layout';
import { ShortcutError } from '../components/ShortcutError';

const Box = styled('div', { boxSizing: 'border-box' });

const NotFound = () => {
  return (
    <Layout>
      <Box
        css={{
          padding: '$navHeightMobile 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}
      >
        <h1>four oh four</h1>
        <Box
          css={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Lottie
            animationData={lottieAnimation}
            loop={true}
            autoPlay={true}
            style={{ width: '60%' }}
          />
        </Box>
        <p>This page doesn&apos;t exist</p>
        <ShortcutError />
      </Box>
    </Layout>
  );
};

export default NotFound;
