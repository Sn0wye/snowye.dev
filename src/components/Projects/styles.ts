import { motion } from 'framer-motion';
import { styled } from '../../../stitches.config';

export const StyledFeaturedProjects = styled(motion.div, {
  margin: '0.625rem 0 0 -1.25rem',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  '@bp2': { flexDirection: 'row' },
});
