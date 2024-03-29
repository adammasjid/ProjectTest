import { FC } from 'react';

/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { PageTitle } from './PageTitle';

interface Props {
   title?: string;
}

export const Page: FC<Props> = ({ title, children }) => {
   return (
      <div
         css={css`
            margin: 0px auto 20px auto;
            padding: 10px 20px;
            max-width: 1500px;
         `}
         data-aos="fade-up"
         data-aos-delay="500"
      >
         {title && <PageTitle> {title} </PageTitle>}
         {children}
      </div>
   );
};
