<template>
  <div class="container">
    <div class="header">
      <i class="btn el-icon-plus new" @click="checkItem"></i>
      <input
        :value="searchItem"
        @keyup.enter="checkItem()"
        @input="evt => (searchItem = evt.target.value)"
      />
      <i class="btn el-icon-close delete" @click="removeDoneItems"></i>
    </div>

    <div
      v-if="suggestionsIsVisible"
      class="suggestions-close-area"
      @click="suggestionsIsVisible = false"
    >
      <div class="suggestions-box">
        <ul class="suggestions">
          <li
            v-for="(item, index) in suggestions"
            :key="item.id"
            @click="addItem(item)"
          >
            <span class="name"> {{ item.name }}</span>
            <i
              class="btn el-icon-remove-outline delete"
              @click.stop="removeProduct(item, index)"
            ></i>
          </li>
        </ul>
      </div>
    </div>
    <transition-group class="list" name="list-items" tag="ul">
      <li
        v-for="(item, index) in list"
        :class="{ isDone: !item.status }"
        :key="index"
        @click="changeStatus(item)"
      >
        <span
          ><div v-if="item.status" class="empty-circle"></div>
          <i v-else class="el-icon-check btn status"></i>
        </span>
        <span class="name"> {{ item.product.name }}</span>
        <i
          class="btn el-icon-remove-outline delete"
          @click.stop="removeItem(item, index)"
        ></i>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchItem: "",
      list: [],
      products: [],
      suggestions: [],
      suggestionsIsVisible: false
    };
  },
  async fetch() {
    console.log("fetching");
    this.list = await this.$db
      .from("epicerie_list")
      .select("id, status, inserted_at, product:epicerie_products(name, id)")
      .order("status", { ascending: false })
      .order("inserted_at", { ascending: false })
      .then(res => {
        return res.data;
      });
    this.products = await this.$db
      .from("epicerie_products")
      .select("id, name")
      .order("name", { ascending: true })
      .then(res => {
        return res.data;
      });
    console.log(this.list);
  },
  fetchOnServer: false,
  watch: {
    searchItem(val) {
      this.searchItem = val;
      this.inputHandler();
    }
  },
  mounted() {
    let ctx = this;
    const listSub = this.$db
      .from("list")
      .on("*", payload => {
        console.log(payload);
        ctx.$fetch();
      })
      .subscribe();
    const productsSub = this.$db
      .from("epicerie_products")
      .on("DELETE", payload => {
        console.log(payload);
        this.$fetch();
      })
      .subscribe();
  },
  methods: {
    inputHandler() {
      if (this.searchItem.length > 1) {
        let str = this.searchItem.toLowerCase();
        this.suggestions = this.products.filter(item =>
          item.name.toLowerCase().includes(str)
        );
        this.suggestionsIsVisible = this.suggestions.length > 0;
      } else {
        this.suggestionsIsVisible = false;
      }
    },
    createFilter(queryString) {
      return item => {
        return item.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    async addItem(item) {
      this.searchItem = "";
      //Fake entry to be fast
      this.list.unshift({ status: 1, product: item });
      const { data, error } = await this.$db
        .from("epicerie_list")
        .insert([{ product: item.id, status: 1 }]);

      //this.reload();
    },
    async changeStatus(item) {
      //Fake entry to be fast
      item.status = item.status ? 0 : 1;

      const { data, error } = await this.$db
        .from("epicerie_list")
        .update({ status: item.status })
        .eq("id", item.id);
      //   this.reload();
    },
    async removeItem(item, index) {
      //Fake entry to be fast
      this.list.splice(index, 1);

      const { data, error } = await this.$db
        .from("epicerie_list")
        .delete()
        .eq("id", item.id);
    },
    async removeProduct(item, index) {
      //Fake entry to be fast
      this.suggestions.splice(index, 1);
      const { data, error } = await this.$db
        .from("epicerie_products")
        .delete()
        .eq("id", item.id);
    },
    checkItem() {
      if (this.searchItem.length > 1) {
        let item = this.products.find(
          e => e.name === this.searchItem.toLowerCase()
        );

        if (item) {
          console.log("item" + item);
          this.addItem(item);
        } else {
          console.log("create");
          this.createItem(this.searchItem);
        }
      }
    },
    async createItem(name) {
      //Fake entry to be fast
      const { data, error } = await this.$db
        .from("epicerie_products")
        .insert([{ name: name.toLowerCase() }]);
      if (data) {
        console.log("adding");
        this.addItem(data[0]);
      }
    },
    removeDoneItems() {
      this.$confirm("Tous les achats complétés seront supprimés. Continuer?", {
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        type: "warning"
      }).then(() => {
        this.doRemoveDoneItems();
      });
    },
    async doRemoveDoneItems() {
      //Fake entry to be fast
      this.list = this.list.filter(item => item.status == 1);
      const { data, error } = await this.$db
        .from("epicerie_list")
        .delete()
        .eq("status", 0);
    },
    reload() {
      this.searchItem = "";
      this.$fetch();
    }
  }
};
</script>

<style>
body,
input {
  font-size: 24px !important;
}
body {
  font-family: "Balsamiq Sans", cursive;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: #edfaff;
}

.container,
.header {
  width: 100%;
}
.header i.btn {
  color: #fff;
}
.header .new {
  margin-right: 10px;
}
.header .delete {
  padding-left: 10px;
  margin-left: auto;
}
i.btn {
  font-weight: bolder !important;
  margin: 1px 0 0 0;
}
.header {
  display: flex;
  align-items: center;
}
.header {
  background-color: #add8e6;
  position: fixed;
  padding: 10px;
  top: 0;
  z-index: 99;
}
ul {
  color: #add8e6;
  list-style-type: none;
  padding: 0 10px;
}

.list li {
  background-color: #edfaff;
}
ul.list {
  margin-top: 60px;
}
.list-items-move {
  z-index: 100;
  transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}
li {
  padding: 10px 0;
  border-bottom: 2px dotted #add8e6;
  width: 100%;
  position: relative;
}
.suggestions li:last-of-type {
  border-bottom: none;
}
.list li:not(.isDone) .name {
  color: #333;
}
.suggestions .name {
  color: black;
}
.list .name {
  margin-left: 10px;
}
.suggestions-close-area {
  height: 100vh;
  position: absolute;
  z-index: 10;
  width: 100%;
  background: none;
}
.suggestions-box {
  background: white;
  padding: 20px 45px 30px 45px;
  box-shadow: 1px 2px 15px 3px rgba(0, 0, 0, 0.51);
  -webkit-box-shadow: 1px 2px 15px 3px rgba(0, 0, 0, 0.51);
  -moz-box-shadow: 1px 2px 15px 3px rgba(0, 0, 0, 0.51);
}

input {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
input {
  font-family: "Balsamiq Sans", cursive;
  font-weight: 100 !important;
  box-sizing: border-box;
  border-radius: 50px !important;
  width: 100% !important;
}
.empty-circle {
  border: 3px solid;
  border-radius: 50%;
  width: 26px;
  display: inline-block;
  height: 26px;
  margin-bottom: -2px;
}
.delete {
  float: right;
}
.el-icon-check {
  padding-top: 2px;
}
.el-message-box {
  width: 80%;
  max-width: 480px;
}
</style>
