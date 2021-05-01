const R = require('ramda');

/**
 * - Clasificar por equipos (Convertir lista de jugadores en listas de jugadores por equipo)
 * - Calcular rendimiento grupal
 * - Calcular rendimiento individual
 * - Calcular sueldo completo
 */
    
const groupByTeams = JSONObj => {
    const getTeamsNames = JSONObj => R.pluck('equipo', JSONObj.jugadores);
    const removeDuplicatedTeamsNames = teamsNamesList => R.uniq(teamsNamesList);
    const filterByTeam = teamName => R.filter(R.pathEq(['equipo'], teamName), JSONObj.jugadores);
    const groupPlayersByTeam = teamsNamesList => R.map(filterByTeam, teamsNamesList);
    
    return R.compose(groupPlayersByTeam, removeDuplicatedTeamsNames, getTeamsNames)(JSONObj);
};

const setTeamsThrowput = teams => {
    const tier2Goals = R.cond([
        [R.equals('A'), R.always(5)],
        [R.equals('B'), R.always(10)],
        [R.equals('C'), R.always(15)],
        [R.equals('Cuauh'), R.always(20)]
    ]); 
    const setPlayerMinGoals = player => R.set(R.lensProp('minimo_goles'), tier2Goals(player.nivel), player);
    const setTeamMinGoals = team => R.map(setPlayerMinGoals, team);

    const sumTeamMinGoals = team => R.sum(R.pluck('minimo_goles', team));
    const sumTeamScoredGoals = team => R.sum(R.pluck('goles', team));
    const getTeamThrowput = team => R.divide(sumTeamScoredGoals(team), sumTeamMinGoals(team));
    const truncateTeamThrowput = team => R.when(R.gte(R.__, 1), R.always(1))(getTeamThrowput(team));
    const setTeamThrowput = team => R.map(R.set(R.lensProp('alcance_equipo'), truncateTeamThrowput(team)), team);

    const setTThrowputByTeam = team => R.compose(setTeamThrowput, setTeamMinGoals)(team);
    return R.map(setTThrowputByTeam, teams);
};

const setIndividualsThrowput = teams => {
    const getPlayerThrowput = player => R.divide(player.goles, player.minimo_goles);
    const truncatePlayerThrowput = player => R.when(R.gte(R.__, 1), R.always(1))(getPlayerThrowput(player));
    const setIThrowputByPlayer = player => R.set(R.lensProp('alcance_individual'), truncatePlayerThrowput(player), player);
    const setIThrowputByTeam = team => R.map(setIThrowputByPlayer, team);
    return R.map(setIThrowputByTeam, teams);
};

const setSalary = teams => {
    const getBonus = player => R.multiply(player.bono, R.mean([player.alcance_equipo, player.alcance_individual]));
    const setCompleteSalaryByPlayer = player => R.set(R.lensProp('sueldo_completo'), R.sum([player.sueldo, getBonus(player)]), player);
    const setCompleteSalaryByTeam = team => R.map(setCompleteSalaryByPlayer, team);
    return R.map(setCompleteSalaryByTeam, teams);
};

const reformatOutputObj = teams => R.objOf('jugadores', R.flatten(teams));

const setSalaries = R.compose(reformatOutputObj, setSalary, setIndividualsThrowput, setTeamsThrowput, groupByTeams);
exports.setSalaries = setSalaries;
