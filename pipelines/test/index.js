const { expect } = require('chai');
const { Pipe, Pipeline, ConditionalPipe, LoopPipe } = require('../index');

describe('Pipe', function() {
    it('should run the function passed to it', async function() {
        const pipe = new Pipe(async (input) => {
            return input + 1;
        });

        const result = await pipe.run(1);
        expect(result).to.equal(2);
    });

    it('should throw an error if the function throws an error', async function() {
        const pipe = new Pipe(async () => {
            throw new Error('Test error');
        });

        try {
            await pipe.run(1);
            throw new Error('Error was not thrown');
        } catch (error) {
            expect(error.message).to.equal('Test error');
        }
    });
});

// Test Pipeline class
describe('Pipeline', function() {
    it('should run all components in the pipeline in order', async function() {
        const pipeline = new Pipeline();
        pipeline.add(new Pipe(async (input) => input + 1));
        pipeline.add(new Pipe(async (input) => input * 2));

        const result = await pipeline.run(1);
        expect(result).to.equal(4); // (1+1)*2
    });

    it('should throw an error if a non-PipelineComponent is added', function() {
        const pipeline = new Pipeline();
        expect(() => pipeline.add({})).to.throw('Component must be a Pipe or Pipeline');
    });
});

// Test ConditionalPipe class
describe('ConditionalPipe', function() {
    it('should run the trueComponent if the condition is true', async function() {
        const conditionalPipe = new ConditionalPipe(async (input) => input === 1);
        conditionalPipe.setTrueComponent(new Pipe(async (input) => input + 1));
        conditionalPipe.setFalseComponent(new Pipe(async (input) => input - 1));

        const result = await conditionalPipe.run(1);
        expect(result).to.equal(2);
    });

    it('should run the falseComponent if the condition is false', async function() {
        const conditionalPipe = new ConditionalPipe(async (input) => input === 1);
        conditionalPipe.setTrueComponent(new Pipe(async (input) => input + 1));
        conditionalPipe.setFalseComponent(new Pipe(async (input) => input - 1));

        const result = await conditionalPipe.run(0);
        expect(result).to.equal(-1);
    });
});

// Test LoopPipe class
describe('LoopPipe', function() {
    it('should loop while the condition is true and stop when it is false', async function() {
        const loopPipe = new LoopPipe(async (input) => input < 3);
        loopPipe.setLoopComponent(new Pipe(async (input) => input + 1));

        const result = await loopPipe.run(0);
        expect(result).to.equal(3);
    });

    it('should not loop if the condition is never true', async function() {
        const loopPipe = new LoopPipe(async (input) => input < 0);
        loopPipe.setLoopComponent(new Pipe(async (input) => input + 1));

        const result = await loopPipe.run(0);
        expect(result).to.equal(0);
    });
});

// You can add more tests to cover edge cases, error handling, etc.

// Similar tests would be written for Pipeline, ConditionalPipe, and LoopPipe
