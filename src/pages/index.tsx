import Head from 'next/head';
import Typewriter from 'typewriter-effect';
import { Layout } from '../components/Layout';
import { OpenCommandPalette } from '../components/OpenCommandPalette';
import { getLocaleProps, useI18n } from '../locales';
import { Container, Content, Title } from '../styles/home';

interface HomeProps {
  title: string;
  description: string;
}

export default function Home() {
  const { scopedT } = useI18n();
  const t = scopedT('pages.home');

  return (
    <Layout>
      <Head>
        <title>{t('title')}</title>
        <meta content={t('title')} property='og:title' />
        <meta content={t('description')} name='description' />
        <meta content={t('description')} property='og:description' />
      </Head>
      <Container>
        <Content>
          <div>
            <Title>{t('title')}</Title>
            <div>
              <strong>{t('meta')}</strong>
              <Typewriter
                options={{
                  strings: t('description'),
                  autoStart: true,
                  deleteSpeed: 80,
                  delay: 60
                }}
              />
            </div>
            <OpenCommandPalette />
          </div>
        </Content>
      </Container>
      <StarCanvas />
    </Layout>
  );
}

export const getStaticProps = getLocaleProps();

import { useRef, Suspense, useState } from 'react';
import { styled } from '../../stitches.config';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
import { inSphere } from 'maath/random';
import { Points as TPoints } from 'three';

const Stars = () => {
  const ref = useRef<TPoints>(null!);
  const [sphere] = useState(() =>
    inSphere(new Float32Array(5000), {
      radius: 1.2
    })
  );

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* @ts-ignore */}
      <Points ref={ref} positions={sphere} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color='#f272c8'
          size={0.002}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarCanvas = () => {
  return (
    <CanvasContainer>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>

        <Preload all />
      </Canvas>
    </CanvasContainer>
  );
};

const CanvasContainer = styled('div', {
  width: '100%',
  height: 'auto',
  position: 'absolute',
  inset: 0,
  zIndex: -1
});
