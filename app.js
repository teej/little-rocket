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
    self.power = opts.power;
    self.fuel = opts.fuel;
    self.type = opts.type;

    self.owned = false;
    return self;
  }
  
  var ENGINE_TYPE = 'engine';
  
  var ENGINES = [
    new Item({cost:  0, name: 'Bottle Rocket', power: 0, fuel: 0, type: ENGINE_TYPE}),
    new Item({cost: 50, name: 'Enigma Blaster', power: 50, fuel: 1, type: ENGINE_TYPE}),
    new Item({cost: 50, name: 'Blue Streaks', power: 75, fuel: 5, type: ENGINE_TYPE}),
    new Item({cost: 50, name: 'Cosmos Engine', power: 75, fuel: 5, type: ENGINE_TYPE})
  ];
  
  var BODY_TYPE = 'rocket_body';

  var BODIES = [
    new Item({cost: 0,  name: 'Plastic Tubing', power: 0, fuel: 0, type: BODY_TYPE}),
    new Item({cost: 50, name: 'Enigma Shell', power: 10, fuel: 1, type: BODY_TYPE}),
    new Item({cost: 75, name: 'Racing Stripe Shell', power: 25, fuel: 1,  type: BODY_TYPE}),
    new Item({cost: 75, name: 'Nova Shell', power: 25, fuel: 1,  type: BODY_TYPE})
  ];
  
  var ACCESSORY_TYPE = 'accessory';

  var ACCESSORIES = [
    // new Item({cost: 0,  name: 'nothing', power: 0, fuel: 0, type: ACCESSORY_TYPE}),
    new Item({cost: 50, name: 'Streamers', power: 0, fuel: 0, type: ACCESSORY_TYPE}),
    new Item({cost: 75, name: 'Balloons', power: 0, fuel: 0, type: ACCESSORY_TYPE}),
    new Item({cost: 75, name: 'Umbrella', power: 0, fuel: 0, type: ACCESSORY_TYPE}),
    new Item({cost: 75, name: 'Space Diver', power: 0, fuel: 0, type: ACCESSORY_TYPE})
    
  ]
  
  var Player = function() {
    var self = this;
    self.money = 100;
    var BASE_POWER = 25;
    var BASE_FUEL = 3;
    
    
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
      else if(item.type == ACCESSORY_TYPE) {
        self.accessory = item;
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
    
    // ACCESSORY
    self.accessory = null;



    self.power = function() {
      var power = BASE_POWER
                  + (self.engine       ? self.engine.power      : 0)
                  + (self.rocket_body  ? self.rocket_body.power : 0)
                  + (self.accessory    ? self.accessory.power   : 0);
      console.log("power: " + power);
      return power;
    }
    
    self.fuel = function() {
      var fuel = BASE_FUEL
                  + (self.engine      ? self.engine.fuel      : 0) 
                  + (self.rocket_body ? self.rocket_body.fuel : 0)
                  + (self.accessory   ? self.accessory.fuel   : 0);
      console.log("fuel: " + fuel);
      return fuel;
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
    self.stage = 0;
    self.takeoff_fuel = 50;
    self.fuel = opts.fuel;
    self.power = opts.power;
    self.distance = 0;
    self.velocity = 0;
    
    self.update = function(dt) {
      
      var time_in_seconds = 1000.0 / dt;
      
      self.distance += self.velocity * time_in_seconds;
      self.velocity += self.acceleration() * (dt / 1000.0);
      
      self.distance = Math.max(self.distance, 0);
      
      if (self.distance == 0) {
        self.velocity = 0;
      }
    }
    
    self.bezier_position = function() {
      return easeOutQuad(self.distance / 500000);
    }
    
    self.acceleration = function() {
      var a = -0.5 * self.power;
      if (self.velocity < 0) {
        a *= 2;
      }
      return a
    }
    
    self.coordinates = function() {
      var x =      parseInt(118 + self.bezier_position() * self.distance/1000);
      var y = -1 * parseInt( 78 + self.bezier_position() * self.distance/1000);
      return {x:x, y:y}
    }
    
    self.position = function() {
      var p = self.coordinates();
      return 'translate('+p.x+'px,'+p.y+'px)';
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
    
    self.burn = function() {
      self.takeoff_fuel -= 1;
      self.velocity = self.power * 0.30;
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
      
      $('#game').append('<img src="loadout/blueprint.png" id="blueprint" />');
      
      var loadout = $('<div id="loadout"></div>');
      
      // Engine
      var engine = $('<div id="engine" class="rocket-component" data-toggle="modal" href="#store"></div>');
      engine.append('<img src="loadout/engine.png" />');
      engine.append('<h1>ENGINE</h1>');
      engine.append('<h2>'+P.engine.name+'</h2>');
      engine.bind('click', function() {
        self.populate_store(ENGINES);
      });
      loadout.append(engine)
      $('#game').append(loadout);

      // Body
      var body = $('<div id="body" class="rocket-component" data-toggle="modal" href="#store"></div>');
      body.append('<img src="loadout/body.png" />');
      body.append('<h1>BODY</h1>');
      body.append('<h2>'+P.rocket_body.name+'</h2>');
      body.bind('click', function() {
        self.populate_store(BODIES);
      });
      loadout.append(body);
      $('#game').append(loadout);

      // Accessory
      var accessory = $('<div id="accessory" class="rocket-component" data-toggle="modal" href="#store"></div>');
      accessory.append('<img src="loadout/accessory.png" />');
      accessory.append('<h1>ACCESSORY</h1><h2></h2>');
      accessory.bind('click', function() {
        self.populate_store(ACCESSORIES);
      });
      loadout.append(accessory);
      $('#game').append(loadout);

      
      
      
      // STORE
      var store = $('<div id="store" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> \
        <div class="modal-header"> \
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button> \
          <h3 id="myModalLabel">STORE</h3> \
        </div> \
        <div class="modal-body"></div> \
      </div>')
      
      $('#game').append(store)
      
      
      //var buy_button = $('<button type="button" class="btn btn-primary" id="buy-button">Buy!</button>');
      //$('#game').append(buy_button);
      // $('#game').append('<div>Engine: <span id="engine">'+P.power()+'</span></div>');
      
      //buy_button.bind('click', self.buy);
      
      
      
      var mission_button = $('<div class="button" id="blast-off">BLAST OFF!</div>');
      $('#game').append(mission_button);
      mission_button.bind('click', function() {
        G.load_scene(new MissionScene());
      });
      
    }
    
    
    
    self.populate_store = function(items) {
      
      $('#store .modal-body').empty();
      
      $.each(items, function(i, item) {
        
        var store_line_item = $('<div>'+item.name + ", cost: "+item.cost + ", power: " +item.power+ ", fuel: " +item.fuel+ (item.owned ? ' OWNED' : '') + '</div>');
        
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
      self.set_item('#engine', P.engine);
      self.set_item('#body', P.rocket_body);
      self.set_item('#accessory', P.accessory);
    }
    
    self.set_item = function(id, item) {
      if (item) {
        $(id + " h2").text(item.name);
        $(id).removeClass('empty')
      } else {
        $(id + " h2").text("Empty");
        $(id).addClass('empty');
      }
    }
    
    
    return self;
  }
  
  var Doober = function(amt, p) {
    var self = this;
    self.amount = amt;
    self.lifetime = 0;
    self.scale = 0.2;
    self.paid = false
    
    self.update = function(dt) {
      self.lifetime += dt;
      if (self.lifetime <= 200) {
        self.scale = 0.2 + 0.8 * (self.lifetime / 200);
        self.set_position(p.x, p.y);
      } else if (self.lifetime <= 1200) {
        self.scale = 1.0
        self.set_position(p.x, p.y);
      } else if (self.lifetime > 1200 && self.lifetime <= 1500) {
        var fly_time = (self.lifetime - 1200) / 300.0;
        
        var x = 120 + (p.x - 120) * (1 - easeOutQuad(fly_time));
        var y = -525 + (p.y + 525) * (1 - easeInQuad(fly_time));
        self.set_position(x,y);
      } else if (self.lifetime <= 1600) {
        if (!self.paid) {
          self.paid = true
          P.money += self.amount;
        }
        self.sprite.css('opacity', (1600 - self.lifetime)/100.0);
      } else {
        self.sprite.css('opacity', 0);
        
      }
    }
    
    self.set_position = function(x, y) {
      self.sprite.css('transform', 'translate('+x+'px,'+y+'px) scale('+self.scale+')');
    }
    
    self.sprite = $('<div id="doober">+'+self.amount+'</div>')
    $('#game').append(self.sprite);
    
    
  }
  
  
  var MissionScene = function() {
    
    var self = this;
    
    self.rocket = P.rocket();
    self.max_distance = 0;
    self.distance_awards = 0;
    self.doobers = []
    
    self.init = function() {
      
      $('#game').css('background-image', 'url(mission/background.jpg)');
      
      // Fuel
      var cell_width =  120 / self.rocket.fuel;
      var cell_margin =  30 / (self.rocket.fuel - 1)
      $('#game').append('<div id="booster"></div>')
      for (var i=self.rocket.fuel; i>0; i--) {
        var margin = (i == 1) ? 0 : cell_margin;
        $('#booster').append('<div class="cell" style="width:'+cell_width+'px; margin-right:'+margin+'px"></div>');
      }
      $('#game').append('<div id="fuel"><div class="fuel-gauge"></div></div>')
      $('#game').append('<ul id="ui-labels"><li>MAX DISTANCE</li><li>FUEL</li><li>BOOSTER</li></ul>')
      $('#game').append('<div id="distance"></div>')
      
      
      $('#game').append('<div id="coin_ui"> <img src="coin.png" /> <span id="money"></span></div>');
      
      var fire_button = $('<div class="button" id="fire-button">Launch!</div>')
      $('#game').append(fire_button);
      $('#game').append('<img src="mission/earth.png" id="earth">');
      
      var rocket = $('<div id="rocket"><img src="mission/rocket.png" > </div>');
      $('#game').append(rocket);
      
      fire_button.bind('click', self.fire);
      
      
    }
    
    self.fire = function() {
      
      
      if (self.rocket.stage == 0) {
        $('#fire-button').hide();
        self.rocket.stage += 1;
        
        // var ticks = self.rocket.takeoff_fuel;
        var interval = setInterval(function() {
          self.rocket.burn();
          // ticks -= 1;
          if (self.rocket.takeoff_fuel == 0){
            clearInterval(interval);
            self.rocket.stage += 1;
            $('#fire-button').show().text('Boost!');
          }
        }, 100)
        
      } else if (self.rocket.fuel > 0) {
        
        self.rocket.fire();
        
        $('#booster .cell').eq(self.rocket.fuel).addClass('empty');
        
        if (self.rocket.fuel == 0) {
          self.rocket.stage += 1;
          $('#fire-button').hide();
        }
        
      }
      
    }
    
    
    self.update = function(dt) {
      
      $('#money').text(P.money);
      
      // Fuel

      $('#fuel .fuel-gauge').css('width', (self.rocket.takeoff_fuel * 100/50.0)+'%');
      
      self.max_distance = Math.max(self.max_distance, Math.floor(self.rocket.distance));
      $('#distance').text(self.max_distance.number_with_delimiter());
      
      if (parseInt(self.max_distance / 50000) > self.distance_awards) {
        self.distance_awards += 1;
        var p = self.rocket.coordinates()
        p.y = p.y - 80;
        self.doobers.push(new Doober(5, p));
      }
      
      $.each(self.doobers, function(i, doober) {
        doober.update(dt);
      });
      
      // Rocket
      self.rocket.update(dt);
      // $('#distance').text(self.rocket.distance_text());
      $('#rocket img').css({transform: self.rocket.scale()});
      $('#rocket').css({transform: self.rocket.position()})
      
      // Planet
      var bezier_position = easeInQuad(self.rocket.distance / 500000);
      var scale = 0.15 + 0.85 * (1 - bezier_position);
      $('#earth').css({
        transform: 'scale('+scale+')',
        left: (30 - (1-scale) * 233.0/2)+'px',
        bottom: (30 - (1-scale) * 211.0/2)+'px'
      });
      
      if (self.rocket.distance == 0 && self.rocket.stage > 1) {
        G.load_scene(LoadOutScene());
      }
      
    }
    
    
    return self;
  }
  
  
  
  
  var G = Game();
  G.start();
})(jQuery);

Number.prototype.number_with_delimiter = function(delimiter) {
    var number = this + '', delimiter = delimiter || ',';
    var split = number.split('.');
    split[0] = split[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + delimiter
    );
    return split.join('.');    
};
