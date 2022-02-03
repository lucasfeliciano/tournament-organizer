import cryptoRandomString from 'crypto-random-string';
import * as Tournament from './Tournament';

/** Class representing an event manager. */
export class Manager {
    /** Array of tournaments being managed. */
    tournaments: Array<Tournament.Structure>;
    
    constructor() {
        this.tournaments = [];
    }

    /**
     * Create a new tournament.
     * @param options User-defined options for a new tournament.
     * @returns New tournament.
     */
    newTournament(opt?: Tournament.Structure): Tournament.Structure {

        // No duplicate tournaments with user-defined IDs
        if (opt.hasOwnProperty('id') && this.tournaments.some(tournament => tournament.id === opt.id)) {
            throw `A tournament with ID ${opt.id} is already in the event manager. Duplicate tournament can not be added.`;
        }

        let defaults: {
            id: string,
            name: string,
            format: 'single elimination' | 'double elimination' | 'swiss' | 'round robin' | 'double round robin'
        } = {
            id: cryptoRandomString({length: 10, type: 'alphanumeric'}),
            name: 'New Tournament',
            format: 'single elimination'
        }
        
        // Default values
        let options: Tournament.BasicTournamentProperties = Object.assign(defaults, opt === undefined ? {} : opt);
        
        // No duplicate IDs
        while (this.tournaments.some(tournament => tournament.id === options.id)) {
            options.id = cryptoRandomString({length: 10, type: 'alphanumeric'});
        }
        
        // Create tournament
        let tournament: Tournament.Structure;
        switch (options.format) {
            case 'single elimination':
                tournament = new Tournament.Elimination(options);
                break;
            case 'double elimination':
                options = Object.assign({
                    double: true
                }, options);
                tournament = new Tournament.Elimination(options);
                break;
            case 'swiss':
                tournament = new Tournament.Swiss(options);
                break;
            case 'round robin':
                tournament = new Tournament.RoundRobin(options);
                break;
            case 'double round robin':
                options = Object.assign({
                    double: true
                }, options);
                tournament = new Tournament.RoundRobin(options);
                break;
        }
        
        // Add tournament to list
        this.tournaments.push(tournament);
        
        return tournament;
    }

    /**
     * Reload a saved tournament.
     * @param tournament The tournament to be reloaded.
     * @returns The reloaded tournament.
     */
    loadTournament(tournament: Tournament.Structure): Tournament.Structure {
        //TODO
    }

    /**
     * Remove a tournament from the manager.
     * @param id ID of the tournament to be removed.
     * @returns The deleted tournament.
     */
    deleteTournament(id: string): Tournament.Structure {
        
        // Find tournament
        const index = this.tournaments.findIndex(t => t.id === id);
        if (index === -1) {
            throw `Tournament with ID ${id} was not found.`;
        }
        const tournament = this.tournaments[index];
            
        // If active, end the tournament
        if (tournament.status !== 'finished') tournament.status = 'aborted';
        
        // Remove the tournament from the list
        this.tournaments.splice(index, 1);
        return tournament;
    }
}
