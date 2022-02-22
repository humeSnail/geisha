import Geisha from '../../geisha';
import { AsyncMapGenerator } from './index';

describe('AsyncMapGenerator', () => {
    test('正常执行', (done) => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((data) => {
            return Promise.resolve(data + data);
        });
        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            done();
        });
    });

    test('执行结果', (done) => {
        let fnRes = 0;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((data) => {
            return Promise.resolve(data + data);
        });

        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(fnRes).toBe(4);
            done();
        });
    });

    test('fn执行出错的情况', (done) => {
        let fnRes = 0;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            throw new Error('a error');
        });

        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(fnRes).toBeInstanceOf(Error);
            // @ts-ignore
            expect(fnRes.message).toBe('a error');
            done();
        });
    });

    test('fn中Promise执行出错的情况', (done) => {
        let fnRes = 0;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return new Promise(() => {
                throw new Error('promise error');
            });
        });

        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(fnRes).toBeInstanceOf(Error);
            // @ts-ignore
            expect(fnRes.message).toBe('promise error');
            done();
        });
    });

    test('fn中Promise reject的情况', (done) => {
        let fnRes = 0;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return Promise.reject(new Error('promise reject'));
        });

        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(fnRes).toBeInstanceOf(Error);
            // @ts-ignore
            expect(fnRes.message).toBe('promise reject');
            done();
        });
    });

    test('参数为error的情况', () => {
        let fnParams;
        let fnRes;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((data: number) => {
            fnParams = data;
            return () => Promise.resolve(data + data);
        });
        const asyncMapWrap = AsyncMapGenerator(spyFn);

        asyncMapWrap(new Error('a error'), spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).not.toHaveBeenCalled();

        expect(fnParams).toBeUndefined();
        expect(fnRes).toBeInstanceOf(Error);
        // @ts-ignore
        expect(fnRes.message).toBe('a error');
    });

    test('集成Geisha', () => {
        const mockFnA = jest.fn().mockImplementation((data: number) => Promise.resolve(data));
        const mockFnB = jest
            .fn()
            .mockImplementation((data: number) => Promise.resolve(data + data));
        const mockFnC = jest
            .fn()
            .mockImplementation((data: number) => Promise.resolve(data + data));

        const geisha = new Geisha();
        let result = 0;

        geisha
            .pipe(
                AsyncMapGenerator(mockFnA),
                AsyncMapGenerator(mockFnB),
                AsyncMapGenerator((data: number) => {
                    result = data;
                    return Promise.resolve('QAQ');
                }),
                AsyncMapGenerator(() => {
                    throw new Error('a error');
                }),
                AsyncMapGenerator(mockFnC)
            )
            .invoke(2)
            .finally(() => {
                expect(result).toBe(4);
                expect(mockFnA).toHaveBeenCalled();
                expect(mockFnB).toHaveBeenCalled();
                expect(mockFnC).not.toHaveBeenCalled();
            });
    });
});
