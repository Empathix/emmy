import { useRef, useEffect, ReactNode } from 'react';
import autosize from 'autosize';

type Props = Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "children"> & {
  children?: (text: string) => ReactNode,
  fixed?: boolean,
  focus?: boolean
}

export const AutoExpandingTextArea = (props: Props) => {
  const { children, fixed, focus, ...textAreaProps } = props;
  const ref = useRef<HTMLTextAreaElement | undefined | null>(null);

  useEffect(() => {
    if (ref && ref.current && !fixed) {
      autosize(ref.current)
    }
  }, [ref, fixed]);

  useEffect(() => {
    if (ref && ref.current && !fixed) {
      autosize.update(ref.current);
    }
  }, [ref, props.value, fixed]);

  useEffect(() => {
    if (ref && ref.current && focus) {
      ref.current.focus()
    }
  }, [ref, focus])

  const approachingLimit = ref.current && ref.current === document.activeElement && props.maxLength && (props.value as string)?.length > (+props.maxLength * 0.85);

  return (
    <>
      <textarea
        rows={1}
        style={{ resize: 'none' }}
        ref={ref as any}
        {...textAreaProps}
      />
      {children && children(approachingLimit ? `${(textAreaProps.value as string).length} / ${textAreaProps.maxLength}` : '')}
    </>
  )
};
