var ProjectBuilder = {};

ProjectBuilder.buildSimpleProject = function(){
    var candidateCoord = new wisemove.Coordinate(10,20);
    var visitCoord = new wisemove.Coordinate(100,200);
    var candidateShape = { prop: 'test'};
    var visitShape = { prop: 'test'};

    var candidate = new wisemove.CandidateLocation(candidateCoord, candidateShape);
    candidate.name("candidate");

    var visit = new wisemove.VisitLocation(visitCoord, visitShape);
    visit.name("name");
    visit.frequency(5);

    var project = new wisemove.Project();
    project.disableRouteLookup(true);
    project.addCandidateLocation(candidate);
    project.addVisitLocation(visit);

    candidate.routeDataArray()[0].durationMinutes(10);

    var measure = new wisemove.Measure();
    measure.name("Test Measure");
    project.addMeasure(measure);

    project.createDefaultPeople();
    project.createDefaultMeasures();

    return project;
}

ProjectBuilder.arrayContainsItem = function(array, item)  {
    var containsItem = false;

    for(var i in array){
        var itemToCheck = array[i];

        if(itemToCheck == item){
            containsItem = true;
            break;
        }
    }

    return containsItem;
}

ProjectBuilder.projectIsConsistent = function(project)  {
    var isConsistent = true;

    // every visit and candidate combination should have a route
    for (var i in project.candidateLocations()) {
        var candidate = project.candidateLocations()[i];

        if (candidate.routeDataArray().length != project.visitLocations().length) {
            isConsistent = false;
            break;
        }

        for (var j in project.visitLocations()) {
            var visit = project.visitLocations()[j];

            var routeFound = false;

            for (var k in candidate.routeDataArray()) {
                var routeData = candidate.routeDataArray()[k];

                if (routeData.visitLocation() == visit && routeData.candidateLocation() == candidate) {
                    routeFound = true;
                    break;
                }
            }

            if (!routeFound) {
                isConsistent = false;
                break;
            }
        }

        if (!isConsistent) {
            break;
        }
    }

    // every measure, candidate and person combination should have a score
    for (var i in project.candidateLocations()) {
        var candidate = project.candidateLocations()[i];

        for (var j in project.measures()) {
            var measure = project.measures()[j];

            if (!measure.isBuiltin()) {

                for (var k in project.people()) {
                    var person = project.people()[k];

                    if (!person.isBuiltin()) {
                        // should be a matching score

                        var scoreFound = false;
                        for (var l in project.scores()) {
                            var score = project.scores()[l];

                            if(score.candidateLocation() == candidate && score.measure() == measure && score.person() == person) {
                                scoreFound = true;
                                break;
                            }
                        }

                        if (!scoreFound) {
                            isConsistent = false;
                            break;
                        }
                    }
                }
            }
        }
    }

    return isConsistent;
}