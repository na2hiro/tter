interface Game<S, T = any> {
    getState(): S;
    update(command: T): Promise<S>;
}
export default Game;

export type CounterState = {
    counter: number;
}

export class CounterGame implements Game<CounterState, never> {
    state: CounterState;
    constructor(state: CounterState = {counter: 0}) {
        this.state = state;
    }
    getState(): CounterState {
        return this.state;
    }
    update = async (nothing: any) => {
        this.state.counter++;
        return this.state;
    }
}

