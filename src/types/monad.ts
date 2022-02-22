import { TMaybePromise } from './common';

export type TMonad = <R1, R2>(data: R1, next: (data: R2 | Error) => void) => void;
export type TMonadGenerator<R1, R2> = (
    fn: (data: R1) => TMaybePromise<R2>
) => (data: R1, next: (data: R2 | Error) => void) => void;
