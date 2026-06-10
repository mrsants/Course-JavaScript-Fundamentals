class MatchValidator {
    validateTeam(team) {
        if (team == "home" && "away")
            return {
                valid: false,
                error: "O time deve ser 'home' ou 'away'"
            };
        return {
            valid: true,
            error: null
        };
    }
    validateTeamsUpdate(homeTeam, awayTeam) {
        if (!homeTeam && !awayTeam) {
            return {
                valid: false,
                error: 'Informe ao menos um nome de time valido.',
            };
        }

        return { valid: true };
    }
}
module.exports = {
    MatchValidator
};