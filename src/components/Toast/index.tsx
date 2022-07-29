import * as ToastPrimitive from '@radix-ui/react-toast';
import { ReactNode } from 'react';
import { IconBaseProps } from 'react-icons';
import { RiCheckboxCircleFill, RiErrorWarningFill } from 'react-icons/ri';
import {
  Close,
  Description,
  IconContainer,
  Root,
  Title,
  Viewport,
} from './styles';

interface ToastProps {
  title: string;
  description: string;
  isSuccess: boolean;
  showToast: boolean;
  setShowToast: (showToast: boolean) => void;
  children?: ReactNode;
}

export function Toast({
  title,
  description,
  isSuccess,
  showToast,
  setShowToast,
  children,
}: ToastProps) {
  const iconColor = isSuccess ? '#4cb782' : '#b75c4c';
  const Icon = (props: IconBaseProps) => {
    return isSuccess ? (
      <RiCheckboxCircleFill {...props} />
    ) : (
      <RiErrorWarningFill {...props} />
    );
  };

  return (
    <ToastPrimitive.Provider>
      {children}
      <Root open={showToast} onOpenChange={setShowToast}>
        <IconContainer>
          <Icon color={iconColor} />
        </IconContainer>
        <div>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </div>
        <Close aria-label='Close'>
          <span aria-hidden>×</span>
        </Close>
      </Root>
      <Viewport />
    </ToastPrimitive.Provider>
  );
}
