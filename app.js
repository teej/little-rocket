(function($){
  
  var Game = function() {
    var self = this;
    
    self.scene;
    self.update_interval;
    
    self.start = function() {
      
      P = Player();
      self.load_scene(new MissionScene());
      
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
  
  
  
  
  var Player = function() {
    var self = this;
    self.money = 105;
    
    
    self.buy_item = function(item) {
      self.money -= item.cost;
      item.owned = true;
    }
    
    self.equip = function(item) {
      if (item.type == ENGINE_TYPE) {
        self.engine = item;
      }
    }
    
    // ENGINE
    self.engine;
    self.buy_item(ENGINES[0]);
    self.equip(ENGINES[0]);
    
    
    
    
    
    
    self.power = function() {
      return 50;
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
      self.velocity -= self.power * (dt / 500.0);
      
      self.distance = Math.max(self.distance, 0);
      
      if (self.distance == 0) {
        self.velocity = 0;
      }
    }
    
    self.position = function() {
      
      // var curve = bezier(0.55, 0.055, 0.675, 0.19, 0.005);
      // var distance = self.distance / 350000;
      // var scale = 100 + (self.distance/1000) * (1 - curve(distance));
      
      
      return (100 + self.distance/1000) + 'px';
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
        G.load_scene(MissionScene());
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
    }
    
    
    return self;
  }
  
  
  var MissionScene = function() {
    
    var self = this;
    
    self.rocket = new Rocket({fuel: 3, power: 500});
    
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
        
        self.rocket.fuel -= 1;
        self.rocket.velocity = self.rocket.power;
        // self.
        
        // $('#rocket').stop().animate({
        //   left: '+='+(P.power() * 4)+'px'
        // }, 500, function() {
        //   self.fall_back();
        // });
        
        // self.update_fuel();
      }
      
    }
    
    self.fall_back = function() {
      // if ( ! $('#rocket').is(':animated')) {
      //   
      //   $('#rocket').animate({
      //     left: '100px'
      //   }, 500, 'easeInCubic', function() {
      //     
      //     if(self.fuel == 0) {
      //       
      //       P.money += 50;
      //       G.load_scene(LoadOutScene());
      //       
      //     }
      //     
      //   });
      // }
      
      
    }
    
    
    self.update = function(dt) {
      $('#fuel-meter').empty();
      
      for (var i=0; i<self.rocket.fuel; i++) {
        $('#fuel-meter').append('<div class="fuel-cell"></div>');
      }
      
      
      self.rocket.update(dt);
      
      $('#distance').text(Math.floor(self.rocket.distance));
      
      $('#rocket').css('left', self.rocket.position());
      $('#rocket').css('bottom', self.rocket.position());
      
      // if (Math.floor(Math.random() * 100) == 3) console.log("***", self.rocket);
      
      // 0 is 100% => 0
      // 1 is 15%  => 500,000 meters
      
      var scale_curve = bezier(0.95, 0.05, 0.795, 0.035, 0.005); // Quad
      var distance = self.rocket.distance / 500000;
      var scale = 0.15 + 0.85 * (1 - scale_curve(distance));
      
      $('#earth').css('transform', 'scale('+scale+')');
      
    }
    
    
    return self;
  }
  
  
  
  
  var G = Game();
  G.start();
})(jQuery);