type Observer<T> = {
    updateScribe: (flag: boolean) => void;
    update: (data: T) => void;
};

class Observable<T> {
    private observers: Observer<T>[] = [];

    subscribe(observer: Observer<T>) {
        this.observers.push(observer);
        observer.updateScribe(true);
    }

    unsubscribe(observer: Observer<T>) {
        this.observers = this.observers.filter(obs => obs !== observer);
        observer.updateScribe(false);
    }

    notify(data: T) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class ObservableState extends Observable<boolean> {
    private state: boolean = false;

    setState(newState: boolean) {
        this.state = newState;
        this.notify(this.state);
    }

    getState(): boolean {
        return this.state;
    }
}

export { Observable, ObservableState, Observer }
