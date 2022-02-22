import Geisha from '../../geisha';
import { MapGenerator } from './index';

describe('MapGenerator', () => {
    test('正常执行', () => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((data) => data);
        const mapWrap = MapGenerator(spyFn);

        mapWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
    });

    test('执行结果', () => {
        let fnParams;
        let fnRes;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((data: number) => {
            fnParams = data;
            return data + data;
        });
        const mapWrap = MapGenerator(spyFn);

        mapWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();

        expect(fnParams).toBe(2);
        expect(fnRes).toBe(4);
    });

    test('fn出错的情况', () => {
        let fnParams;
        let fnRes;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((_: number) => {
            throw new Error('a error');
        });
        const mapWrap = MapGenerator(spyFn);

        mapWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();

        expect(fnParams).toBeUndefined();
        expect(fnRes).toBeInstanceOf(Error);

        // @ts-ignore
        expect(fnRes.message).toBe('a error');
    });

    test('参数为error的情况', () => {
        let fnParams;
        let fnRes;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            fnRes = data;
        });
        const spyFn = jest.fn().mockImplementation((data: number) => {
            fnParams = data;
            return data + data;
        });
        const mapWrap = MapGenerator(spyFn);

        mapWrap(new Error('a error'), spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).not.toHaveBeenCalled();

        expect(fnParams).toBeUndefined();
        expect(fnRes).toBeInstanceOf(Error);
        // @ts-ignore
        expect(fnRes.message).toBe('a error');
    });

    test('集成Geisha', () => {
        const mockFnA = jest.fn().mockImplementation(() => 1);
        const mockFnB = jest.fn().mockImplementation((data: number) => data + data);
        const mockFnC = jest.fn().mockImplementation((data: number) => data);

        const geisha = new Geisha();
        let result;

        geisha
            .pipe(
                MapGenerator(mockFnA),
                MapGenerator(mockFnB),
                MapGenerator((data: number) => {
                    result = data;
                }),
                MapGenerator(() => {
                    throw new Error('a error');
                }),
                MapGenerator(mockFnC)
            )
            .invoke();

        expect(result).toBe(2);
        expect(mockFnA).toHaveBeenCalled();
        expect(mockFnB).toHaveBeenCalled();
        expect(mockFnC).not.toHaveBeenCalled();
    });
});
