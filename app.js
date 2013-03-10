(function($){
  var E = 0.0005;
  var easeInExpo  = bezier(0.95, 0.05, 0.795, 0.035, E);
  var easeOutExpo = bezier(0.19, 1, 0.22, 1, E);
  var easeInQuad  = bezier(0.55, 0.085, 0.68, 0.53, E);
  var easeOutQuad = bezier(0.25, 0.46, 0.45, 0.94, E);
  
  
  var Game = function() {
    var self = this;
    
    self.scene;
    self.update_interval;
    
    self.start = function() {
      
      P = Player();
      self.load_scene(new LoadOutScene());
      
      self.last_update = new Date() / 1.0;
      if (self.update_interval) clearInterval(self.update_interval);
      self.update_interval = setInterval(self.update, 1000/30.0);
    }
    
    self.load_scene = function(scene) {
      $('#game').empty();
      self.scene = scene;
      self.scene.init();
    }
    
    self.update = function() {
      if (self.scene) {
        var now = new Date() / 1.0;
        var dt = now - self.last_update;
        self.scene.update(dt);
        self.last_update = now;
      }
    }
    
    return self;
  }
  
  var Item = function(opts) {
    var self = this;
    self.cost = opts.cost
    self.name = opts.name;
    self.type = opts.type;
    self.owned = false;
    return self;
  }
  
  var ENGINE_TYPE = 'engine';
  
  var ENGINES = [
    new Item({cost:  5, name: 'Bottle Rocket Engine', type: ENGINE_TYPE}),
    new Item({cost: 50, name: 'Enigma Blaster',       type: ENGINE_TYPE})
  ];
  
  var BODY_TYPE = 'rocket_body';

  var BODIES = [
    new Item({cost: 5,  name: 'Bottle Shell',        type: BODY_TYPE}),
    new Item({cost: 50, name: 'Enigma Shell',        type: BODY_TYPE}),
    new Item({cost: 75, name: 'Racing Stripe Shell', type: BODY_TYPE})
  ];
  
  
  
  var Player = function() {
    var self = this;
    self.money = 110;
    
    
    self.buy_item = function(item) {
      self.money -= item.cost;
      item.owned = true;
    }
    
    self.equip = function(item) {
      if (item.type == ENGINE_TYPE) {
        self.engine = item;
      }
      else if(item.type == BODY_TYPE) {
        self.rocket_body = item;
      }
    }
    
    // ENGINE
    self.engine;
    self.buy_item(ENGINES[0]);
    self.equip(ENGINES[0]);

    // BODY
    self.rocket_body;
    self.buy_item(BODIES[0]);
    self.equip(BODIES[0]);
    
    
    self.power = function() {
      return 50;
    }
    
    self.fuel = function() {
      return 3;
    }
    
    self.rocket = function() {
      
      return new Rocket({
        fuel: self.fuel(),
        power: self.power()
      });
    }
    
    return self;
  }
  
  var Rocket = function(opts) {
    var self = this;
    self.fuel = opts.fuel;
    self.power = opts.power;
    self.distance = 0;
    self.velocity = 0;
    
    self.update = function(dt) {
      
      var time_in_seconds = 1000.0 / dt;
      
      self.distance += self.velocity * time_in_seconds;
      self.velocity -= self.power * (dt / 2000.0);
      
      self.distance = Math.max(self.distance, 0);
      
      if (self.distance == 0) {
        self.velocity = 0;
      }
    }
    
    self.bezier_position = function() {
      return easeOutQuad(self.distance / 500000);
    }
    
    self.position = function() {
      
      var x =      parseInt(118 + self.bezier_position() * self.distance/1000);
      var y = -1 * parseInt( 78 + self.bezier_position() * self.distance/1000);
      
      return 'translate('+x+'px,'+y+'px)';
    }
    
    self.scale = function() {
      var scale = 0.2 + 0.8 * self.bezier_position();
      return 'scale('+scale+') rotate(45deg)';
    }
    
    self.fire = function() {
      self.fuel -= 1;
      self.velocity = Math.max(self.velocity, 0);
      self.velocity = self.power;
    }
    
    self.distance_text = function() {
      if (self.distance < 100000) {
        return Math.floor(self.distance);
      } else {
        return (Math.floor(self.distance / 1000) + 'k');
      }
    }
    
    
    return self;
  }
  
  
  var LoadOutScene = function() {
    
    var self = this;
    
    self.init = function() {
      
      $('#game').css('background-image', 'url(loadout/background.jpg)');
      
      // COIN UI
      $('#game').append('<div id="coin_ui"> <img src="coin.png" /> <span id="money">'+P.money+'</span></div>');
      
      
      
      var loadout = $('<div id="loadout"></div>');
      
      // Engine
      var engine = $('<div class="rocket-component" data-toggle="modal" href="#store"></div>');
      engine.append('<img src="loadout/engine.png" />');
      engine.append('<h1>ENGINE</h1>');
      engine.append('<h2 id="engine">'+P.engine.name+'</h2>');
      engine.bind('click', function() {
        self.populate_store(ENGINES);
      });
      loadout.append(engine)
      $('#game').append(loadout);

      // Body
      var body = $('<div class="rocket-component" data-toggle="modal" href="#store"></div>');
      body.append('<img src="loadout/body.png" />');
      body.append('<h1>BODY</h1>');
      body.append('<h2 id="body">'+P.rocket_body.name+'</h2>');
      body.bind('click', function() {
        self.populate_store(BODIES);
      });
      loadout.append(body);
      $('#game').append(loadout);

      
      
      
      // STORE
      var store = $('<div id="store" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> \
        <div class="modal-header"> \
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> \
          <h3 id="myModalLabel">Modal header</h3> \
        </div> \
        <div class="modal-body"></div> \
      </div>')
      
      $('#game').append(store)
      
      
      //var buy_button = $('<button type="button" class="btn btn-primary" id="buy-button">Buy!</button>');
      //$('#game').append(buy_button);
      // $('#game').append('<div>Engine: <span id="engine">'+P.power()+'</span></div>');
      
      //buy_button.bind('click', self.buy);
      
      
      
      var mission_button = $('<img src="loadout/blast-off.png" id="blast-off" />');
      $('#game').append(mission_button);
      mission_button.bind('click', function() {
        G.load_scene(new MissionScene());
      });
      
    }
    
    
    
    self.populate_store = function(items) {
      
      $('#store .modal-body').empty();
      
      $.each(items, function(i, item) {
        
        var store_line_item = $('<div>'+item.name + ", cost: "+item.cost + (item.owned ? ' OWNED' : '') + '</div>');
        
        store_line_item.bind('click', function() {
          self.buy_or_equip(item);
        })
        
        $('#store .modal-body').append(store_line_item);
      });
      
    }
    
    self.buy_or_equip = function(item) {
      
      if (item.owned) {
        P.equip(item);
      } else if (P.money >= item.cost) {
        P.buy_item(item);
        P.equip(item);
      }
      
      $('#store').modal('hide');
      // self.update();
      
    }
    
    self.update = function(dt) {
      $('#money').text(P.money);
      $('#engine').text(P.engine.name);
      $('#body').text(P.rocket_body.name);
    }
    
    
    return self;
  }
  
  
  var MissionScene = function() {
    
    var self = this;
    
    self.rocket = P.rocket();
    
    self.init = function() {
      
      $('#game').css('background-image', 'url(mission/background.jpg)');
      
      $('#game').append('<div id="fuel-meter"></div>')
      // self.update_fuel();
      
      
      var fire_button = $('<button type="button" class="btn btn-danger" id="fire-button">Fire</button>');
      $('#game').append(fire_button);
      $('#game').append('<img src="mission/earth.png" id="earth">');
      
      var rocket = $('<div id="rocket"><img src="mission/rocket.png" > <span id="distance"></span></div>');
      $('#game').append(rocket);
      
      fire_button.bind('click', self.fire);
      
      
    }
    
    self.fire = function() {
      
      if (self.rocket.fuel > 0) {
        self.rocket.fire();
      }
      
    }
    
    
    self.update = function(dt) {
      $('#fuel-meter').empty();
      
      for (var i=0; i<self.rocket.fuel; i++) {
        $('#fuel-meter').append('<div class="fuel-cell"></div>');
      }
      
      
      self.rocket.update(dt);
      
      $('#distance').text(self.rocket.distance_text());
      
      $('#rocket img').css({transform: self.rocket.scale()});
      $('#rocket').css({transform: self.rocket.position()})
      
      // if (Math.floor(Math.random() * 100) == 3) console.log("***", self.rocket);
      
      // 0 is 100% => 0
      // 1 is 15%  => 500,000 meters
      
      var bezier_position = easeInQuad(self.rocket.distance / 500000);
      var scale = 0.15 + 0.85 * (1 - bezier_position);
      
      // Scale the earth with anchor point {0,0}
      $('#earth').css({
        transform: 'scale('+scale+')',
        left: (30 - (1-scale) * 233.0/2)+'px',
        bottom: (30 - (1-scale) * 211.0/2)+'px'
      });
      
      if (self.rocket.distance == 0 && self.rocket.fuel == 0) {
        P.money += 50;
        G.load_scene(LoadOutScene());
      }
      
    }
    
    
    return self;
  }
  
  
  
  
  var G = Game();
  G.start();
})(jQuery);