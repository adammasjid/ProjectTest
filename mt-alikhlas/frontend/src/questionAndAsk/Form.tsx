import { FC, useState, createContext, FormEvent } from 'react';
import { PrimaryButton, gray5, gray6 } from './Styles';
/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { css, jsx } from '@emotion/react';

export interface Values {
   [key: string]: any;
}

interface FormContextProps {
   values: Values;
   setValue?: (fieldName: string, value: any) => void;
   errors: Errors;
   validate?: (fieldName: string) => void;
   touched: Touched;
   setTouched?: (fieldName: string) => void;
}

interface Validation {
   validator: Validator;
   arg?: any;
}
interface ValidationProp {
   [key: string]: Validation | Validation[];
}

export interface Errors {
   [key: string]: string[];
}
export interface Touched {
   [key: string]: boolean;
}

export interface submitResult {
   success: boolean;
   errors?: Errors;
}

export const FormContext = createContext<FormContextProps>({
   values: {},
   errors: {},
   touched: {},
});

type Validator = (value: any, args?: any) => string;
export const required: Validator = (value: any): string =>
   value === undefined || value === null || value === ''
      ? 'ini harus diisi'
      : '';
export const minLength: Validator = (value: any, length: number): string =>
   value && value.length < length
      ? `setidaknya harus terdiri dari ${length} characters`
      : '';

interface Props {
   submitCaption?: string;
   validationRules?: ValidationProp;
   onSubmit: (values: Values) => Promise<submitResult>;
   successMessage?: string;
   failureMessage?: string;
}

export const Form: FC<Props> = ({
   submitCaption,
   children,
   validationRules,
   onSubmit,
   successMessage = 'Success!',
   failureMessage = 'Something went wrong',
}) => {
   const [values, setValues] = useState<Values>({});
   const [errors, setErrors] = useState<Errors>({});
   const [touched, setTouched] = useState<Touched>({});
   const [submitting, setSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [submitError, setSubmitError] = useState(false);
   const validate = (fieldName: string) => {
      if (!validationRules) {
         return [];
      }
      if (!validationRules[fieldName]) {
         return [];
      }
      const rules = Array.isArray(validationRules[fieldName])
         ? (validationRules[fieldName] as Validation[])
         : ([validationRules[fieldName]] as Validation[]);
      const fieldErrors: string[] = [];
      rules.forEach((rule: any) => {
         const error = rule.validator(values[fieldName], rule.arg);
         if (error) {
            fieldErrors.push(error);
         }
      });
      const newErrors = { ...errors, [fieldName]: fieldErrors };
      setErrors(newErrors);
      return fieldErrors;
   };
   const validateForm = () => {
      const newErrors: Errors = {};
      let haveError: boolean = false;
      if (validationRules) {
         Object.keys(validationRules).forEach((fieldName) => {
            newErrors[fieldName] = validate(fieldName);
            if (newErrors[fieldName].length > 0) {
               haveError = true;
            }
         });
      }
      setErrors(newErrors);
      return !haveError;
   };
   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
         setSubmitting(true);
         setSubmitError(false);
         const result = await onSubmit(values);
         setErrors(result.errors || {});
         setSubmitting(false);
         setSubmitted(true);
      }
   };

   return (
      <FormContext.Provider
         value={{
            values,
            setValue: (filedName: string, value: any) => {
               setValues({ ...values, [filedName]: value });
            },
            errors,
            validate,
            touched,
            setTouched: (fieldName: string) => {
               setTouched({ ...touched, [fieldName]: true });
            },
         }}
      >
         <form noValidate={true} onSubmit={handleSubmit}>
            <fieldset
               disabled={submitting || (submitted && !submitError)}
               css={css`
                  margin: 10px auto 0 auto;
                  padding: 30px;
                  width: 350px;
                  background-color: ${gray6};
                  border-radius: 4px;
                  border: 1px solid ${gray5};
                  box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
               `}
            >
               {children}
               <div
                  css={css`
                     margin: 30px 0px 0px 0px;
                     padding: 20px 0px 0px 0px;
                     border-top: 1px solid ${gray5};
                  `}
               >
                  <PrimaryButton type="submit">{submitCaption}</PrimaryButton>
               </div>
               {submitted && submitError && (
                  <p
                     css={css`
                        color: red;
                     `}
                  >
                     {failureMessage}
                  </p>
               )}
               {submitted && !submitError && (
                  <p
                     css={css`
                        color: green;
                     `}
                  >
                     {successMessage}
                  </p>
               )}
            </fieldset>
         </form>
      </FormContext.Provider>
   );
};
