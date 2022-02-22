import Geisha from '../../geisha';
import { TerminateGenerator } from './index';
import { MapGenerator } from '../map';

describe('TerminateGenerator', () => {
    test('参数为正常值的情况', () => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((_) => {
            return true;
        });

        /**
         * terminate返回值为true的情况
         */
        const terminateWrap = TerminateGenerator(spyFn);
        terminateWrap(1, spyNextFn);

        expect(spyFn).toHaveBeenCalled();
        expect(spyNextFn).not.toHaveBeenCalled();

        /**
         * terminal返回值为false的情况
         */
        const spyFalseFn = jest.fn().mockImplementation((_) => {
            return false;
        });
        spyNextFn.mockClear();

        const terminateFalseWrap = TerminateGenerator(spyFalseFn);
        terminateFalseWrap(1, spyNextFn);

        expect(spyFalseFn).toHaveBeenCalled();
        expect(spyNextFn).toHaveBeenCalled();
    });

    test('返回值为Promise的情况', (done) => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((_) => {
            return Promise.resolve(false);
        });

        /**
         * terminate返回值为true的情况
         */
        const terminateWrap = TerminateGenerator(spyFn);
        terminateWrap(1, spyNextFn);

        setTimeout(() => {
            expect(spyFn).toHaveBeenCalled();
            expect(spyNextFn).toHaveBeenCalled();
            done();
        });
    });

    test('返回值为Promise且出错的情况', (done) => {
        let res;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            res = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return new Promise(() => {
                throw new Error('a error');
            });
        });

        /**
         * terminate返回值为true的情况
         */
        const terminateWrap = TerminateGenerator(spyFn);
        terminateWrap(1, spyNextFn);

        setTimeout(() => {
            expect(spyFn).toHaveBeenCalled();
            expect(spyNextFn).toHaveBeenCalled();
            expect(res).toBe(1);
            done();
        });
    });

    test('参数为Error的情况', () => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((_) => {
            return true;
        });

        const terminateWrap = TerminateGenerator(spyFn);

        terminateWrap(new Error('a error'), spyNextFn);

        expect(spyFn).toHaveBeenCalled();
        expect(spyNextFn).not.toHaveBeenCalled();
    });

    test('fn运行出错的情况', () => {
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            throw new Error('a error');
        });

        const terminateWrap = TerminateGenerator(spyFn);
        terminateWrap(1, spyNextFn);

        expect(spyFn).toHaveBeenCalled();
        expect(spyNextFn).toHaveBeenCalled();
        expect(nextParams).toBe(1);
    });

    test('集成Geisha', () => {
        let res;
        const spyFnA = jest.fn().mockImplementation((data) => {
            res = data + '(spyFnA)';
            return res;
        });
        const spyFnB = jest.fn().mockImplementation((data) => {
            res = data + '(spyFnB)';
            return res;
        });
        const spyTerminateA = jest.fn().mockImplementation((data) => {
            res = data + '(spyTerminateA)';
            return true;
        });
        const spyTerminateB = jest.fn().mockImplementation((data) => {
            res = data + '(spyTerminateB)';
            return false;
        });

        /**
         * 被终止的情况
         */
        new Geisha()
            .pipe(MapGenerator(spyFnA), TerminateGenerator(spyTerminateA), MapGenerator(spyFnB))
            .invoke('inital')
            .finally(() => {
                expect(spyFnA).toHaveBeenCalled();
                expect(spyTerminateA).toHaveBeenCalled();
                expect(spyFnB).not.toHaveBeenCalled();
                expect(res).toBe('inital(spyFnA)(spyTerminateA)');
            });

        /**
         * 未被终止的情况
         */
        res = '';
        spyFnA.mockClear();
        spyFnB.mockClear();
        spyTerminateA.mockClear();

        new Geisha()
            .pipe(MapGenerator(spyFnA), TerminateGenerator(spyTerminateB), MapGenerator(spyFnB))
            .invoke('inital')
            .finally(() => {
                expect(spyFnA).toHaveBeenCalled();
                expect(spyTerminateB).toHaveBeenCalled();
                expect(spyFnB).toHaveBeenCalled();
                expect(res).toBe('inital(spyFnA)(spyFnB)');
            });
    });
});
