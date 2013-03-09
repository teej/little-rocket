(function($){
  
  var Game = function() {
    var self = this;
    self.start = function() {
      
      P = Player();
      
      self.load_scene(MissionScene());
    }
    
    self.load_scene = function(scene) {
      $('#game').empty();
      scene.init();
    }
    
    return self;
  }
  
  var Player = function() {
    var self = this;
    self.money = 100;
    self.engine = 50;
    
    return self;
  }
  
  
  var LoadOutScene = function() {
    
    var self = this;
    
    self.init = function() {
      
      var buy_button = $('<button type="button" class="btn btn-primary" id="buy-button">Buy!</button>');
      $('#game').append(buy_button);
      $('#game').append('<div>Money: <span id="money">'+P.money+'</span></div>');
      $('#game').append('<div>Engine: <span id="engine">'+P.engine+'</span></div>');
      
      buy_button.bind('click', self.buy);
      
      
      
      var mission_button = $('<button type="button" class="btn btn-primary" id="buy-button">Go On Mission</button>');
      $('#game').append(mission_button);
      mission_button.bind('click', function() {
        G.load_scene(MissionScene());
      });
      
    }
    
    self.buy = function () {
      if (P.money >= 75) {
        P.engine += 20;
        P.money -= 75;
        self.update();
      }
    }
    
    self.update = function() {
      $('#money').text(P.money);
      $('#engine').text(P.engine);
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
          left: '+='+(P.engine * 4)+'px'
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
        }, 3000, 'easeInCubic', function() {
          
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