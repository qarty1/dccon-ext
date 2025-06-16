class Observable {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
        observer.updateScribe(true);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
        observer.updateScribe(false);
    }

    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class ObservableState extends Observable {
    constructor() {
        super();
        this.state = false;
    }

    setState(newState) {
        this.state = newState;
        this.notify(this.state);
    }

    getState() {
        return this.state;
    }
}

export {Observable, ObservableState}