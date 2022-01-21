<template>
  <div class="row q-py-md" v-if="categories.length > 4">
    <div
      class="col-6 q-py-md text-center"
      v-for="category in categories"
      :key="`topcat-${category.id}`"
    >
      <q-btn
        round
        color="primary"
        size="20px"
        @click="$emit('goNext', category.id)"
      >
        <img :src="category.img" style="max-height: 30px;" />
      </q-btn>
      <div class="text-subtitle2 q-pt-sm" @click="$emit('goNext', category.id)">
        {{ category.name }}
      </div>
    </div>
  </div>
  <div class="row q-py-md" v-else>
    <div
      class="col-12 q-py-lg q-pl-md"
      v-for="category in categories"
      :key="`topcat-${category.id}`"
    >
      <q-btn
        round
        color="primary"
        size="22px"
        @click="$emit('goNext', category.id)"
      >
        <img :src="category.img" style="max-height: 40px;" />
      </q-btn>
      <span
        class="text-h6 text-weight-regular q-pl-sm"
        @click="$emit('goNext', category.id)"
      >
        {{ category.name }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  mounted() {},
  data() {
    return {}
  },
  methods: {},
  computed: {
    ...mapGetters({
      categories: 'company/categories'
    })
  }
}
</script>
