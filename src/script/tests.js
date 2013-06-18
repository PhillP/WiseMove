module( "IdGenerator");

test( "IdGenerator.getNext generates sequential Ids", function() {
    var generator = new wisemove.IdGenerator();

    var expectedId = 0;
    var actualId = 0;

    for (var i = 0; i < 10; i++) {
        expectedId++;
        actualId = generator.getNext();
        equal(actualId, expectedId, "getNext returned an unexpected Id");
    }
});

test( "IdGenerator.ensureNextBeyond pushes next Id forward", function() {
    var generator = new wisemove.IdGenerator();

    generator.ensureNextBeyond(10);
    var expectedId = 11;
    var actualId = generator.getNext();
    equal(actualId, expectedId, "getNext returned an unexpected Id");

    expectedId++;
    // ensureNextBeyond should do nothing if Id is already beyond range
    generator.ensureNextBeyond(5);
    actualId = generator.getNext();
    equal(actualId, expectedId, "getNext returned an unexpected Id");
});

module("MapBounds");
test( "MapBounds.isInitialised returns false when all bounds 0", function() {
    var bounds= new wisemove.MapBounds(0, 0, 0, 0);
    equal(bounds.isInitialised(), false, "isInitialised should return false when all bounds 0");
});

test( "MapBounds.isInitialised returns true when bounds non-zero 0", function() {
    var bounds= new wisemove.MapBounds(1, 0, 0, 0);
    equal(bounds.isInitialised(), true, "isInitialised should return true when any bounds non-zero");

    bounds= new wisemove.MapBounds(0, 1, 0, 0);
    equal(bounds.isInitialised(), true, "isInitialised should return true when any bounds non-zero");

    var bounds= new wisemove.MapBounds(0, 0, 1, 0);
    equal(bounds.isInitialised(), true, "isInitialised should return true when any bounds non-zero");

    var bounds= new wisemove.MapBounds(0, 0, 0, 1);
    equal(bounds.isInitialised(), true, "isInitialised should return true when any bounds non-zero");
});

test( "MapBounds.getCenter returns expected coordinate", function() {
    var bounds = new wisemove.MapBounds(10, 50, 20, 100);
    var center = bounds.getCenter();

    equal(center.lat(), 15, "center lat not calculated correctly");
    equal(center.lng(), 75, "center lng not calculated correctly");
});

test("MapBounds to and from persistable object cycle", function() {
    var bounds = new wisemove.MapBounds(10, 50, 20, 100);
    var po = bounds.toPersistableObject();

    var bounds2 = wisemove.MapBounds.fromPersistableObject(po);
    equal(bounds.upperLat(), bounds2.upperLat());
    var po2 = bounds2.toPersistableObject();

    deepEqual(po, po2);
});

module("Coordinate");
test("Coordinate to and from persistable object cycle", function() {
    var coord = new wisemove.Coordinate(10, 50);
    var po = coord.toPersistableObject();

    var coord2 = wisemove.Coordinate.fromPersistableObject(po);
    equal(coord.lat(), coord2.lat());
    var po2 = coord2.toPersistableObject();

    deepEqual(po, po2);
});

module("Person");
test("Person to and from persistable object cycle", function() {
    var person = new wisemove.Person();
    person.name("Person Name");
    person.isBuiltin(true);

    var po = person.toPersistableObject();

    var person2 = wisemove.Person.fromPersistableObject(po);
    equal(person.name(), person2.name());
    var po2 = person2.toPersistableObject();

    deepEqual(po, po2);
});

test("Person clone produces equivalent object", function() {
    var person = new wisemove.Person();
    person.name("Person Name");
    person.isBuiltin(true);
    var po = person.toPersistableObject();

    var person2 = person.clone();
    equal(person.name(), person2.name());
    var po2 = person2.toPersistableObject();

    deepEqual(po, po2);
});

module("Measure");
test("Measure to and from persistable object cycle", function() {
    var obj1 = new wisemove.Measure();
    obj1.name("Measure Name");
    obj1.weighting(5);
    obj1.isBuiltin(true);

    var po = obj1.toPersistableObject();

    var obj2 = wisemove.Measure.fromPersistableObject(po);
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

test("Measure clone produces equivalent object", function() {
    var obj1 = new wisemove.Measure();
    obj1.name("Measure Name");
    obj1.weighting(5);
    obj1.isBuiltin(true);
    var po = obj1.toPersistableObject();

    var obj2 = obj1.clone();
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

module("VisitLocation");
test("VisitLocation to and from persistable object cycle", function() {
    var coord = new wisemove.Coordinate(10,20);
    var shape = { prop: 'test'};

    var obj1 = new wisemove.VisitLocation(coord, shape);
    obj1.name("VisitLocation Name");
    obj1.frequency(5);

    var po = obj1.toPersistableObject();

    var obj2 = wisemove.VisitLocation.fromPersistableObject(po);
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

test("VisitLocation clone produces equivalent object", function() {
    var coord = new wisemove.Coordinate(10,20);
    var shape = { prop: 'test'};

    var obj1 = new wisemove.VisitLocation(coord, shape);
    obj1.name("VisitLocation Name");
    obj1.frequency(5);
    var po = obj1.toPersistableObject();

    var obj2 = obj1.clone();
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

module("CandidateLocation");
test("CandidateLocation to and from persistable object cycle", function() {
    var coord = new wisemove.Coordinate(10,20);
    var shape = { prop: 'test'};

    var obj1 = new wisemove.CandidateLocation(coord, shape);
    obj1.name("CandidateLocation Name");

    var po = obj1.toPersistableObject();

    var obj2 = wisemove.CandidateLocation.fromPersistableObject(po);
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

test("CandidateLocation clone produces equivalent object", function() {
    var coord = new wisemove.Coordinate(10,20);
    var shape = { prop: 'test'};

    var obj1 = new wisemove.CandidateLocation(coord, shape);
    obj1.name("CandidateLocation Name");
    var po = obj1.toPersistableObject();

    var obj2 = obj1.clone();
    equal(obj1.name(), obj2.name());
    var po2 = obj2.toPersistableObject();

    deepEqual(po, po2);
});

module("RouteData");

test("RouteData to and from persistable object cycle", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];

    var po = routeData.toPersistableObject();
    var routeData2 = wisemove.RouteData.fromPersistableObject(po, project, candidate);
    equal(routeData.durationMinutes(), routeData2.durationMinutes());
    var po2 = routeData2.toPersistableObject();

    deepEqual(po, po2);
});

test("RouteData clone produces equivalent object", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];
    var po = routeData.toPersistableObject();

    var routeData2 = routeData.clone();
    equal(routeData.durationMinutes(), routeData2.durationMinutes());
    var po2 = routeData2.toPersistableObject();

    deepEqual(po, po2);
});

test("RouteData scoreMinutes calculated correctly with and without override", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];
    var po = routeData.toPersistableObject();

    routeData.durationMinutes(10);
    routeData.visitLocation().frequency(5);

    equal(50, routeData.scoreMinutes());

    routeData.overrideDurationMinutes(20);
    equal(100, routeData.scoreMinutes());
});

test("RouteData scoreMinutes calculated correctly with and without override", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];
    var po = routeData.toPersistableObject();

    routeData.durationMinutes(10);
    routeData.visitLocation().frequency(5);

    equal(50, routeData.scoreMinutes());

    routeData.overrideDurationMinutes(20);
    equal(100, routeData.scoreMinutes());
});

test("RouteData displayMinutes calculated correctly with and without override", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];
    var po = routeData.toPersistableObject();

    routeData.durationMinutes(10);
    equal(10, routeData.displayMinutes());

    routeData.overrideDurationMinutes(20);
    equal(20, routeData.displayMinutes());
});

test("RouteData effectiveDurationMinutes calculated correctly with and without override", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];
    var po = routeData.toPersistableObject();

    routeData.durationMinutes(10);
    equal(10, routeData.effectiveDurationMinutes());

    routeData.overrideDurationMinutes(20);
    equal(20, routeData.effectiveDurationMinutes());
});

test("RouteData calculateLatLongDistance calculates sensible distances", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var candidate = project.candidateLocations()[0];
    var routeData = candidate.routeDataArray()[0];

    // perth lat lng
    routeData.candidateLocation().coordinate(new wisemove.Coordinate(31.9554, 115.8585));
    // sydney lat lng
    routeData.visitLocation().coordinate(new wisemove.Coordinate(33.8683, 151.2086));

    var distanceFromPerthToSydneyKms = 3198;
    var distance = routeData.calculateLatLongDistance();

    ok(distance >= distanceFromPerthToSydneyKms * 0.95);
    ok(distance <= distanceFromPerthToSydneyKms * 1.05);
});

module("Score");
test("Score to and from persistable object cycle", function() {
    var project = ProjectBuilder.buildSimpleProject();

    var score= project.scores()[0];
    score.scoreValue(5);

    var po = score.toPersistableObject();

    var score2 = wisemove.Score.fromPersistableObject(po, project);
    equal(score.scoreValue(), score2.scoreValue());
    var po2 = score2.toPersistableObject();

    deepEqual(po, po2);
});

module("Project");
test("Project: add / delete person - project is consistent at each stage", function() {
    var project = ProjectBuilder.buildSimpleProject();
    ok(ProjectBuilder.projectIsConsistent(project));

    // add a person..ensure data is consistent
    var personCount = project.people().length;
    var person = new wisemove.Person();
    person.name("new");
    project.addPerson(person);

    var expectedPersonCount = personCount + 1;
    equal(project.people().length, expectedPersonCount);
    ok(ProjectBuilder.arrayContainsItem(project.people(), person));
    ok(ProjectBuilder.projectIsConsistent(project));

    // remove person.. ensure data is consistent
    project.removePerson(person);
    expectedPersonCount--;
    equal(project.people().length, expectedPersonCount);
    ok(!ProjectBuilder.arrayContainsItem(project.people(), person));
    ok(ProjectBuilder.projectIsConsistent(project));
});

test("Project: add / delete measure - project is consistent at each stage", function() {
    var project = ProjectBuilder.buildSimpleProject();
    ok(ProjectBuilder.projectIsConsistent(project));

    // add a measure..ensure data is consistent
    var measureCount = project.measures().length;
    var measure = new wisemove.Measure();
    measure.name("new");
    project.addMeasure(measure);

    var expectedMeasureCount = measureCount + 1;
    equal(project.measures().length, expectedMeasureCount);
    ok(ProjectBuilder.arrayContainsItem(project.measures(), measure));
    ok(ProjectBuilder.projectIsConsistent(project));

    // remove measure.. ensure data is consistent
    project.removeMeasure(measure);
    expectedMeasureCount--;
    equal(project.measures().length, expectedMeasureCount);
    ok(!ProjectBuilder.arrayContainsItem(project.measures(), measure));
    ok(ProjectBuilder.projectIsConsistent(project));
});

test("Project: add / delete candidate location - project is consistent at each stage", function() {
    var project = ProjectBuilder.buildSimpleProject();
    ok(ProjectBuilder.projectIsConsistent(project));

    // add a candidate..ensure data is consistent
    var candidateCount = project.candidateLocations().length;
    var candidate = new wisemove.CandidateLocation();
    candidate.name("new");
    project.addCandidateLocation(candidate);

    var expectedCandidateCount = candidateCount + 1;
    equal(project.candidateLocations().length, expectedCandidateCount);
    ok(ProjectBuilder.arrayContainsItem(project.candidateLocations(), candidate));
    ok(ProjectBuilder.projectIsConsistent(project));

    // remove candidate.. ensure data is consistent
    project.removeCandidateLocation(candidate);
    expectedCandidateCount--;
    equal(project.candidateLocations().length, expectedCandidateCount);
    ok(!ProjectBuilder.arrayContainsItem(project.candidateLocations(), candidate));
    ok(ProjectBuilder.projectIsConsistent(project));
});

test("Project: add / delete visit location - project is consistent at each stage", function() {
    var project = ProjectBuilder.buildSimpleProject();
    ok(ProjectBuilder.projectIsConsistent(project));

    // add a visit..ensure data is consistent
    var visitCount = project.visitLocations().length;
    var visit = new wisemove.VisitLocation();
    visit.name("new");
    project.addVisitLocation(visit);

    var expectedVisitCount = visitCount + 1;
    equal(project.visitLocations().length, expectedVisitCount);
    ok(ProjectBuilder.arrayContainsItem(project.visitLocations(), visit));
    ok(ProjectBuilder.projectIsConsistent(project));

    // remove visit.. ensure data is consistent
    project.removeVisitLocation(visit);
    expectedVisitCount--;
    equal(project.visitLocations().length, expectedVisitCount);
    ok(!ProjectBuilder.arrayContainsItem(project.visitLocations(), visit));
    ok(ProjectBuilder.projectIsConsistent(project));
});

/*
test("Project: to and from persistable objects cycle", function() {
});


test("Project: collatescores...scores collate correctly", function() {
});
*/
