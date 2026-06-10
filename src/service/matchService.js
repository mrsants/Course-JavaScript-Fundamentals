const { MatchValidator } = require('../validator/matchValidator');
const { MatchTimerService } = require('./matchTimerService');
const HttpStatus = require('http-status-codes');
const { Match } = require('../model/match');

class MatchService {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.match = new Match();
    this.match.timer = this.match.createTimer(this.durationSeconds);
    this.matchTimerService = new MatchTimerService(this.match, () =>
      this.getWinner()
    );
  }


  getScoreBoard() {
    this.matchTimerService.syncTimerState();

    return {
      success: true,
      message: "placar da partida",
      scoreBoard: this.match.scoreBoard,
      timer: this.match.timer,
      winner: this.match.winner,
    };
  }

  // Adiciona um ponto para o time informado
  addPoint(team) {

    // Valida se o time informado existe e é válido
    const validation = new MatchValidator().validateTeam(team);

    // Se o time for inválido, retorna erro 400 (Bad Request)
    if (!validation.valid) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: validation.error
      };
    }

    // Atualiza o estado do timer antes de registrar o ponto
    // Ex: verificar se o tempo acabou, sincronizar cronômetro etc.
    this.matchTimerService.syncTimerState();

    // Verifica se a partida já terminou
    if (this.match.timer.endedAt) {

      // Se terminou, impede que novos pontos sejam adicionados
      return {
        valid: false,
        error: 'A partida terminou. Resete o placar para iniciar uma nova partida.',
      };
    }


    // Adiciona um ponto ao time escolhido
    this.match.scoreBoard.addPoint(team);

    // Retorna sucesso
    return {
      success: true,
      message: 'Ponto adicionado com sucesso.',
      status: 200,
      scoreBoard: this.match.scoreBoard,
      timer: this.match.timer,
      winner: this.match.winner,
    };
  }
  updateTeams(homeTeam, awayTeam) {
    console.log('Atualizando times:', { homeTeam, awayTeam });
    const validation =
      new MatchValidator().validateTeamsUpdate(homeTeam, awayTeam);

    if (!validation.valid) {
      return {
        success: false,
        status: 400,
        error: validation.error
      };
    }

    //this.matchTimerService.syncTimerState();
    console.log('Estado do timer antes de atualizar os times:', this.match.timer);
    if (this.match.timer.endedAt) {
      return {
        success: false,
        status: 400,
        error: 'A partida foi encerrada.'
      };
    }

    this.match.scoreBoard.updateTeams(homeTeam, awayTeam);

    return {
      success: true,
      status: 200,
      message: 'Nomes dos times atualizados com sucesso.',
      scoreBoard: this.match.scoreBoard,
      timer: this.match.timer,
      winner: this.match.winner,
    };
  }
  removePoint(team) {
    const validation = new MatchValidator().validateTeam(team);
    if (!validation.valid) {
      return {
        success: false,
        status: 400,
        error: validation.error
      };
    }
    this.matchTimerService.syncTimerState();
    if (this.match.timer.endedAt) {
      return {
        valid: false,
        error: "A partida terminou. Resete o placar para iniciar uma nova partida.",
      };
    }
    this.match.scoreBoard.removePoint(team);
    return {
      success: true,
      message: 'Ponto removido com sucesso.',
      status: 200,
      scoreBoard: this.match.scoreBoard,
      timer: this.match.timer,
      winner: this.match.winner,
    }
  };
  getWinner() {
    if (this.match.scoreBoard.homeScore > this.match.scoreBoard.awayScore) {
      return {
        team: 'home',
        name: this.match.scoreBoard.homeTeam,
        label: 'Vitoria do time da casa',
      };
    }

    if (this.match.scoreBoard.awayScore > this.match.scoreBoard.homeScore) {
      return {
        team: 'away',
        name: this.match.scoreBoard.awayTeam,
        label: 'Vitoria do time visitante',
      };
    }

    return {
      team: 'draw',
      name: 'Empate',
      label: 'Partida empatada',
    };
  }
};
module.exports = {
  MatchService
};






