new Vue({
  el: "#main",
  data: function(){
    return {
      page: "menu",
      models: [],
      categories: [],
      newCategory:{
        name : "",
        items: [],
      },
      newModel: {
        name: "",
        columns: []
      },
    };
  },
  methods: {
    addNewCategoryItem: function(){
      this.newCategory.items.push({name: "", editing: true});
    },
    saveNewCategory: function(){
      this.categories.push({
        name: this.newCategory.name,
        items: this.newCategory.items
      });
      this.saveCategories();
      this.page = "categories";
    },
    addNewColumn: function(){
      this.newModel.columns.push({name : "NewColumn", category : "Empty"});
      Vue.set(this.newModel.columns[this.newModel.columns.length - 1], "editing", true);
    },
    saveNewModel: function(){
      this.models.push(this.newModel);
      this.saveModels();
      this.page = "models";
    },
    saveCategories: function(){
      this.saveToLocalStorage("fdc_categories", this.categories);
    },
    saveModels: function(){
      this.saveToLocalStorage("fdc_models", this.models);
    },
    saveToLocalStorage: function(key, item){
      localStorage.setItem(key, JSON.stringify(item));
    },
    getFromLocalStorage: function(key){
      var item = localStorage.getItem(key);
      if(item == null)
        return [];
      return JSON.parse(item);
    }
  },
  watch: {
    page: function(newValue, oldValue){
      if(oldValue == "newModel"){
        this.newModel = {
          name: "",
          columns: []
        };
      }
      if(oldValue == "newCategory"){
        this.newCategory= {
          name : "",
          items: [],
          newItem : false,
          newItemName: ""
        };
      }
    }
  },
  mounted: function(){
    this.categories = this.getFromLocalStorage("fdc_categories");
    this.models = this.getFromLocalStorage("fdc_models");
    document.getElementById("main").style.display = "block";
  }
});

