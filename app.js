(function($){
  
  var Game = function() {
    var self = this;
    self.start = function() {
      
      P = Player();
      
      self.load_scene(new MissionScene());
    }
    
    self.load_scene = function(scene) {
      $('#game').empty();
      scene.init();
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
      self.update();
      
    }
    
    self.update = function() {
      $('#money').text(P.money);
      $('#engine').text(P.engine.name);
    }
    
    
    return self;
  }
  
  
  var MissionScene = function() {
    
    var self = this;
    
    self.fuel = 3;
    
    self.init = function() {
      
      $('#game').append('<div id="fuel-meter"></div>')
      self.update_fuel();
      
      
      var fire_button = $('<button type="button" class="btn btn-danger" id="fire-button">Fire</button>');
      $('#game').append(fire_button);
      $('#game').append('<img src="earth.png" id="earth">');
      
      var rocket = $('<img src="rocket.png" id="rocket">');
      $('#game').append(rocket);
      
      fire_button.bind('click', self.fire);
      
      
    }
    
    self.fire = function() {
      
      if (self.fuel > 0) {
        
        self.fuel -= 1;
        
        $('#rocket').stop().animate({
          left: '+='+(P.power() * 4)+'px'
        }, 500, function() {
          self.fall_back();
        });
        
        self.update_fuel();
      }
      
    }
    
    self.fall_back = function() {
      if ( ! $('#rocket').is(':animated')) {
        
        $('#rocket').animate({
          left: '100px'
        }, 500, 'easeInCubic', function() {
          
          if(self.fuel == 0) {
            
            P.money += 50;
            G.load_scene(LoadOutScene());
            
          }
          
        });
      }
      
      
    }
    
    self.update_fuel = function() {
      $('#fuel-meter').empty();
      
      for (var i=0; i<self.fuel; i++) {
        $('#fuel-meter').append('<div class="fuel-cell"></div>');
      }
      
      
    }
    
    
    return self;
  }
  
  
  
  
  var G = Game();
  G.start();
})(jQuery);