export interface GameState {
    handleAction(session: any, action: any): Promise<any>;
    canProceed(session: any): boolean;
    getNextState(session: any): GameState;
}