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
    const updateJSONObj = teamsList => R.set(R.lensProp('jugadores'), teamsList, JSONObj);
    
    return R.compose(updateJSONObj, groupPlayersByTeam, removeDuplicatedTeamsNames, getTeamsNames)(JSONObj);
};

const setTeamsMinGoals = JSONObj => {
    const tier2Goals = R.cond([
        [R.equals('A'), R.always(5)],
        [R.equals('B'), R.always(10)],
        [R.equals('C'), R.always(15)],
        [R.equals('Cuauh'), R.always(20)]
    ]); 

    const setMinGoalsByPlayer = player => R.set(R.lensProp('minimo_goles'), tier2Goals(player.nivel), player);
    const setMinGoalsByTeam = team => R.map(setMinGoalsByPlayer, team);
    const setMinGoals = teams => R.map(setMinGoalsByTeam, teams);

    return R.set(R.lensProp('jugadores'), setMinGoals(JSONObj.jugadores), JSONObj);
};

const setTeamsThrowput = JSONObj => {
    const sumTeamMinGoals = team => R.sum(R.pluck('minimo_goles', team));
    const sumTeamScoredGoals = team => R.sum(R.pluck('goles', team));
    const getTeamThrowput = team => R.divide(sumTeamScoredGoals(team), sumTeamMinGoals(team));
    const truncateTeamThrowput = team => R.when(R.gte(R.__, 1), R.always(1))(getTeamThrowput(team));
    const setThrowputByTeam = team => R.map(R.set(R.lensProp('alcance_equipo'), truncateTeamThrowput(team)), team);
    const setThrowput = teams => R.map(setThrowputByTeam, teams);

    return R.set(R.lensProp('jugadores'), setThrowput(JSONObj.jugadores), JSONObj);
};

const setIndividualsThrowput = JSONObj => {
    const getPlayerThrowput = player => R.divide(player.goles, player.minimo_goles);
    const truncatePlayerThrowput = player => R.when(R.gte(R.__, 1), R.always(1))(getPlayerThrowput(player));
    const setIThrowputByPlayer = player => R.set(R.lensProp('alcance_individual'), truncatePlayerThrowput(player), player);
    const setIThrowputByTeam = team => R.map(setIThrowputByPlayer, team);
    const setIThrowput = teams => R.map(setIThrowputByTeam, teams);

    return R.set(R.lensProp('jugadores'), setIThrowput(JSONObj.jugadores), JSONObj);
};

const setSalary = JSONObj => {
    const getBonus = player => R.multiply(player.bono, R.mean([player.alcance_equipo, player.alcance_individual]));
    const setCompleteSalaryByPlayer = player => R.set(R.lensProp('sueldo_completo'), R.sum([player.sueldo, getBonus(player)]), player);
    const setCompleteSalaryByTeam = team => R.map(setCompleteSalaryByPlayer, team);
    const setCompleteSalary = teams => R.map(setCompleteSalaryByTeam, teams);

    return R.set(R.lensProp('jugadores'), R.flatten(setCompleteSalary(JSONObj.jugadores)), JSONObj);
};

const setSalaries = R.compose(setSalary, setIndividualsThrowput, setTeamsThrowput, setTeamsMinGoals, groupByTeams);
exports.setSalaries = setSalaries;
