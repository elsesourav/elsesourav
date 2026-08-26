import React from 'react';
import { Dialog, type DialogProps } from './Dialog';

export type ModalProps = DialogProps;

export const Modal: React.FC<ModalProps> = (props) => {
  return <Dialog {...props} />;
};
