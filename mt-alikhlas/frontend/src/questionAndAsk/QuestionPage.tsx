import React, { FC, useState, Fragment, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Page } from './Page';
import {
   QuestionData,
   getQuestion,
   postAnswer,
   mapQuestionFromServer,
   QuestionDataFromServer,
} from './QuestionsData';
import { gray3, gray6 } from './Styles';
import { AnswerList } from './AnswerList';
import { Field } from './Field';
import { Form, minLength, required, Values } from './Form';
import {
   HubConnectionState,
   HubConnectionBuilder,
   HubConnection,
} from '@aspnet/signalr';
import { useAuth } from './Auth';
import { server } from './AppSettings';

/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { css, jsx } from '@emotion/react';

interface RouteParams {
   questionId: string;
}

export const QuestionPage: FC<RouteComponentProps<RouteParams>> = ({
   match,
}) => {
   const { isAuthenticated } = useAuth();
   const [question, setQuestion] = useState<QuestionData | null>(null);
   const setUpSignalRConnection = async (questionId: number) => {
      const connection = new HubConnectionBuilder()
         .withUrl('https://mtalikhlas-backend.azurewebsites.net/questionshub')
         .withAutomaticReconnect()
         .build();
      connection.on('Message', (message: string) => {
         console.log('Message', message);
      });
      connection.on('ReceiveQuestion', (question: QuestionDataFromServer) => {
         console.log('ReceiveQuestion', question);
         setQuestion(mapQuestionFromServer(question));
      });
      try {
         await connection.start();
      } catch (err) {
         console.log(err);
      }
      if (connection.state === HubConnectionState.Connected) {
         connection
            .invoke('SubscribeQuestion', questionId)
            .catch((err: Error) => {
               return console.error(err.toString());
            });
      }
      return connection;
   };

   const cleanUpSignalRConnection = async (
      questionId: number,
      connection: HubConnection
   ) => {
      if (connection.state === HubConnectionState.Connected) {
         try {
            await connection.invoke('UnsubscribeQuestion', questionId);
         } catch (err) {
            return console.error(err.toString());
         }
         connection.off('Message');
         connection.off('ReceiveQuestion');
         connection.stop();
      } else {
         connection.off('Message');
         connection.off('ReceiveQuestion');
         connection.stop();
      }
   };

   useEffect(() => {
      let cancelled = false;
      const doGetQuestion = async (questionId: number) => {
         const foundQuestion = await getQuestion(questionId);
         if (!cancelled) {
            setQuestion(foundQuestion);
         }
      };
      let connection: HubConnection;
      if (match.params.questionId) {
         const questionId = Number(match.params.questionId);
         doGetQuestion(questionId);
         setUpSignalRConnection(questionId).then((con) => {
            connection = con;
         });
      }
      return function cleanUp() {
         cancelled = true;
         if (match.params.questionId) {
            const questionId = Number(match.params.questionId);
            cleanUpSignalRConnection(questionId, connection);
         }
      };
   }, [match.params.questionId]);

   const handleSubmit = async (values: Values) => {
      const result = await postAnswer({
         questionId: question!.questionId,
         content: values.content,
         userName: 'Fred',
         created: new Date(),
      });
      return { success: result ? true : false };
   };
   return (
      <Page>
         <div
            css={css`
               background-color: white;
               padding: 15px 20px 20px 20px;
               border-radius: 4px;
               border: 1px solid ${gray6};
               box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
            `}
         >
            <div
               css={css`
                  font-size: 19px;
                  font-weight: bold;
                  margin: 10px 0px 5px;
               `}
            >
               {question === null ? '' : question.title}
            </div>
            {question !== null && (
               <Fragment>
                  <p
                     css={css`
                        margin-top: 0px;
                        background-color: white;
                     `}
                  >
                     {question.content}
                  </p>
                  <div
                     css={css`
                        font-size: 12px;
                        font-style: italic;
                        color: ${gray3};
                     `}
                  >
                     {`
            Asked by ${question.userName} on
            ${question.created.toLocaleDateString()}
            ${question.created.toLocaleTimeString()}
            `}
                  </div>
                  <AnswerList data={question.answers} />
                  <div
                     css={css`
                        margin-top: 20px;
                     `}
                  >
                     {isAuthenticated && (
                        <Form
                           submitCaption="Submit Your Answer"
                           validationRules={{
                              content: [
                                 { validator: required },
                                 { validator: minLength, arg: 50 },
                              ],
                           }}
                           onSubmit={handleSubmit}
                           failureMessage="There was a problem with your answer"
                           successMessage="Your answer was successfully submitted"
                        >
                           <Field
                              name="content"
                              label="Your Answer"
                              type="TextArea"
                           />
                        </Form>
                     )}
                  </div>
               </Fragment>
            )}
         </div>
      </Page>
   );
};
