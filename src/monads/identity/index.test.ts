import Geisha from '../../geisha';
import { IdentityGenerator } from './index';
import { MapGenerator } from '../map';
import { AsyncMapGenerator } from '../async-map';

describe('IdentityGenerator', () => {
    test('返回值非Promise，参数为Error', () => {
        let cacheData;
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            cacheData = 'modifyByFn';
            return cacheData;
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(new Error('a error'), spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(cacheData).toBe('modifyByFn');
        expect(nextParams).toBeInstanceOf(Error);
        expect(nextParams.message).toBe('a error');
    });

    test('返回值非Promise，参数非Error', () => {
        let cacheData;
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((data) => {
            cacheData = data + data;
            return cacheData;
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(cacheData).toBe(4);
        expect(nextParams).toBe(2);
    });

    test('返回值非Promise，fn运行出错', () => {
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            throw new Error('throw by fn');
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(nextParams).toBe(2);
    });

    test('返回值为Promise，参数为Error', (done) => {
        let cacheData;
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return new Promise((resolve) => {
                cacheData = 'modifyByFn';
                resolve(cacheData);
            });
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(new Error('a error'), spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(cacheData).toBe('modifyByFn');
            expect(nextParams).toBeInstanceOf(Error);
            expect(nextParams.message).toBe('a error');
            done();
        });
    });

    test('返回值为Promise，参数非Error', (done) => {
        let cacheData;
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((data) => {
            return new Promise((resolve) => {
                cacheData = data + data;
                resolve(cacheData);
            });
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(cacheData).toBe(4);
            expect(nextParams).toBe(2);
            done();
        });
    });

    test('返回值为Promise，fn运行出错', (done) => {
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((data) => {
            return new Promise(() => {
                throw new Error('throw by fn');
            });
        });
        const identityWrap = IdentityGenerator(spyFn);

        identityWrap(2, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(nextParams).toBe(2);
            done();
        });
    });

    test('集成Geisha', () => {
        let res;
        const identityFn = jest.fn().mockImplementation((data) => {
            return new Promise((resolve) => {
                resolve(data + '(run identityFn)');
            });
        });
        const resultFn = jest.fn().mockImplementation((data) => {
            res = data;
        });
        const asyncMapFn = jest.fn().mockImplementation((data) => {
            return new Promise((resolve) => {
                resolve(data + '(run asyncMap)');
            });
        });
        const mapFn = jest.fn().mockImplementation((data) => data + '(run map)');

        new Geisha()
            .pipe(
                MapGenerator(mapFn),
                IdentityGenerator(identityFn),
                AsyncMapGenerator(asyncMapFn),
                IdentityGenerator(resultFn)
            )
            .invoke('inital')
            .finally(() => {
                expect(identityFn).toHaveBeenCalled();
                expect(resultFn).toHaveBeenCalled();
                expect(asyncMapFn).toHaveBeenCalled();
                expect(mapFn).toHaveBeenCalled();

                expect(res).toBe('inital(run map)(run asyncMap)');
            });
    });
});
