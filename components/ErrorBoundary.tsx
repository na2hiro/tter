import React from "react";
export class ErrorBoundary extends React.Component<{}, {hasError: boolean}> {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        //logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div style={{padding: "10px", backgroundColor: "#eee"}}>
                <h3 style={{color: "red"}}>Error while rendering shogi board</h3>
            </div>;
        }

        return this.props.children;
    }
}