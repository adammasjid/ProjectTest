import { FC } from 'react';
import 'aos/dist/aos.css';

export const DividerAbout: FC = ({ children }) => {
   return (
      <section id="about">
         {/* <div className="container">
            <div className="row">
               <div
                  className="col-lg-12"
                  css={css`
                     font-size: 20px;
                     padding: 5px;
                  `}
               >
                  {children}
                  Scroll Down <br />
                  <HiArrowNarrowDown
                     css={css`
                        font-size: 50px;
                        @keyframes downarrow {
                           0% {
                              -webkit-transform: translateY(0);
                              opacity: 0.4;
                           }
                           100% {
                              -webkit-transform: translateY(0.4em);
                              opacity: 0.9;
                           }
                        }
                        -webkit-animation: downarrow 0.6s infinite alternate
                           ease-in-out;
                        animation: downarrow 0.6s infinite alternate ease-in-out;
                     `}
                  />
               </div>
            </div>
         </div> */}
      </section>
   );
};
