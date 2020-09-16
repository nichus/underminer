const lib = require("lib.js");
const CreepsPerLevel = {
    
    1:{workers:3},
    2:{workers:7},
    3:{miners:1,transports:1,workers:6}, 
    4:{miners:2,transports:2,workers:5},
    5:{miners:2,transports:2,workers:5},
    6:{miners:2,transports:2,workers:5},
    7:{miners:2,transports:2,workers:5},
    8:{miners:2,transports:2,workers:5},
    
}
StructureSpawn.prototype.spawn = function(){
    
    if(this.spawning){return}
    
    const obj = CreepsPerLevel[this.room.controller.level]
    const workers = _.sum(Game.creeps, (c) => c.memory.role == 'worker' && c.memory.birthRoom == this.room.name);
    const miners = _.sum(Game.creeps, (c) => c.memory.role == 'miner' && c.memory.birthRoom == this.room.name);
    const transports = _.sum(Game.creeps, (c) => c.memory.role == 'transport' && c.memory.birthRoom == this.room.name);
    
    const names =  ["JAMES","JOHN","ROBERT","MICHAEL","WILLIAM","DAVID","RICHARD","CHARLES","JOSEPH","THOMAS","CHRISTOPHER","DANIEL","PAUL","MARK","DONALD","GEORGE","KENNETH","STEVEN","EDWARD","BRIAN","RONALD","ANTHONY","KEVIN","JASON","MATTHEW","GARY","TIMOTHY","JOSE","LARRY","JEFFREY","FRANK","SCOTT","ERIC","STEPHEN","ANDREW","RAYMOND","GREGORY","JOSHUA","JERRY","DENNIS","WALTER","PATRICK","PETER","HAROLD","DOUGLAS","HENRY","CARL","ARTHUR","RYAN","ROGER","JOE","JUAN","JACK","ALBERT","JONATHAN","JUSTIN","TERRY","GERALD","KEITH","SAMUEL","WILLIE","RALPH","LAWRENCE","NICHOLAS","ROY","BENJAMIN","BRUCE","BRANDON","ADAM","HARRY","FRED","WAYNE","BILLY","STEVE","LOUIS","JEREMY","AARON","RANDY","HOWARD","EUGENE","CARLOS","RUSSELL","BOBBY","VICTOR","MARTIN","ERNEST","PHILLIP","TODD","JESSE","CRAIG","ALAN","SHAWN","CLARENCE","SEAN","PHILIP","CHRIS","JOHNNY","EARL","JIMMY","ANTONIO","DANNY","BRYAN","TONY","LUIS","MIKE","STANLEY","LEONARD","NATHAN","DALE","MANUEL","RODNEY","CURTIS","NORMAN","ALLEN","MARVIN","VINCENT","GLENN","JEFFERY","TRAVIS","JEFF","CHAD","JACOB","LEE","MELVIN","ALFRED","KYLE","FRANCIS","BRADLEY","JESUS","HERBERT","FREDERICK","RAY","JOEL","EDWIN","DON","EDDIE","RICKY","TROY","RANDALL","BARRY","ALEXANDER","BERNARD","MARIO","LEROY","FRANCISCO","MARCUS","MICHEAL","THEODORE","CLIFFORD","MIGUEL","OSCAR","JAY","JIM","TOM","CALVIN","ALEX","JON","RONNIE","BILL","LLOYD","TOMMY","LEON","DEREK","WARREN","DARRELL","JEROME","FLOYD","LEO","ALVIN","TIM","WESLEY","GORDON","DEAN","GREG","JORGE","DUSTIN","PEDRO","DERRICK","DAN","LEWIS","ZACHARY","COREY","HERMAN","MAURICE","VERNON","ROBERTO","CLYDE","GLEN","HECTOR","SHANE","RICARDO","SAM","RICK","LESTER","BRENT","RAMON","CHARLIE","TYLER","GILBERT","GENE","MARC","REGINALD","RUBEN","BRETT","ANGEL","NATHANIEL","RAFAEL","LESLIE","EDGAR","MILTON","RAUL","BEN","CHESTER","CECIL","DUANE","FRANKLIN","ANDRE","ELMER","BRAD","GABRIEL","RON","MITCHELL","ROLAND","ARNOLD","HARVEY","JARED","ADRIAN","KARL","CORY","CLAUDE","ERIK","DARRYL","JAMIE","NEIL","JESSIE","CHRISTIAN","JAVIER","FERNANDO","CLINTON","TED","MATHEW","TYRONE","DARREN","LONNIE","LANCE","CODY","JULIO","KELLY","KURT","ALLAN","NELSON","GUY","CLAYTON","HUGH","MAX","DWAYNE","DWIGHT","ARMANDO","FELIX","JIMMIE","EVERETT","JORDAN","IAN","WALLACE","KEN","BOB","JAIME","CASEY","ALFREDO","ALBERTO","DAVE","IVAN","JOHNNIE","SIDNEY","BYRON","JULIAN","ISAAC","MORRIS","CLIFTON","WILLARD","DARYL","ROSS","VIRGIL","ANDY","MARSHALL","SALVADOR","PERRY","KIRK","SERGIO","MARION","TRACY","SETH","KENT","TERRANCE","RENE","EDUARDO","TERRENCE","ENRIQUE","FREDDIE","WADE","KENNY","DRAKE"]
    
    if(workers < obj.workers){
        
        this.spawnCreep(lib.genBody("worker",this.room.energyCapacityAvailable),names[Math.floor(Math.random() * names.length)],{memory:{role:"worker",full:false,birthRoom:this.room.name}})
        
    }
    
    if(miners < obj.miners){
        
        this.spawnCreep(lib.genBody("miner",this.room.energyCapacityAvailable),names[Math.floor(Math.random() * names.length)],{memory:{role:"miner",birthRoom:this.room.name}})
        
    }
    
    if(transports < obj.transports){
        
        this.spawnCreep(lib.genBody("transport",this.room.energyCapacityAvailable),names[Math.floor(Math.random() * names.length)],{memory:{role:"transport",full:false,birthRoom:this.room.name}})
        
    }
    
}
