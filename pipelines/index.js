class PipelineComponent {
    async run(input) {
        throw new Error('Run method must be implemented');
    }
}

class Pipe extends PipelineComponent {
    constructor(func) {
        super();
        this.func = func;
    }

    async run(input) {
        try {
            return await this.func(input);
        } catch (error) {
            throw error;
        }
    }
}


class Pipeline extends PipelineComponent {
    constructor() {
        super();
        this.components = [];
    }

    add(component) {
        if (component instanceof PipelineComponent) {
            this.components.push(component);
        } else {
            throw new Error('Component must be a Pipe or Pipeline');
        }
        return this;
    }

    async run(input) {
        let result = input;
        for (let component of this.components) {
            result = await component.run(result);
        }
        return result;
    }
}


class ConditionalPipe extends PipelineComponent {
    constructor(conditionFunc) {
        super();
        this.conditionFunc = conditionFunc;
        this.trueComponent = null;
        this.falseComponent = null;
    }

    setTrueComponent(component) {
        if (component instanceof PipelineComponent) {
            this.trueComponent = component;
        } else {
            throw new Error('True component must be a Pipe or Pipeline');
        }
        return this;
    }

    setFalseComponent(component) {
        if (component instanceof PipelineComponent) {
            this.falseComponent = component;
        } else {
            throw new Error('False component must be a Pipe or Pipeline');
        }
        return this;
    }

    async run(input) {
        if (!this.trueComponent || !this.falseComponent) {
            throw new Error('Conditional pipe requires both true and false components');
        }

        try {
            const conditionResult = await this.conditionFunc(input);
            if (conditionResult) {
                return await this.trueComponent.run(input);
            } else {
                return await this.falseComponent.run(input);
            }
        } catch (error) {
            throw error;
        }
    }
}


class LoopPipe extends PipelineComponent {
    constructor(conditionFunc) {
        super();
        this.conditionFunc = conditionFunc; // 设置循环条件
        this.loopComponent = null;
    }

    setLoopComponent(component) {
        if (!(component instanceof PipelineComponent)) {
            throw new Error('Loop component must be a Pipe or Pipeline');
        }
        this.loopComponent = component;
        return this;
    }

    async run(input) {
        if (!this.loopComponent) {
            throw new Error('Loop component is not set');
        }

        let result = input;
        while (await this.conditionFunc(result)) {
            result = await this.loopComponent.run(result);
        }
        return result;
    }
}

module.exports = {
    Pipeline,
    Pipe,
    ConditionalPipe,
    LoopPipe
};
