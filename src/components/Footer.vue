<template>
  <div class="footer-wrapper">
    <a class="footer-item" @click="dialogVisible=true">About</a>
    <a class="footer-item" target="_blank" href="https://github.com/HughDai/free-drawing">Github</a>
    <el-dialog
      v-model="dialogVisible"
      title="About"
      width="40%"
    >
      <p>TODO About</p>
      <span>Name: </span> Hugh Dai
      <br>
      <span>Email: </span> hughdai1988@gmail.com
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElDialog } from 'element-plus'

export default defineComponent({
  name: 'Footer',
  components: {
    ElDialog
  },
  setup () {
    const dialogVisible = ref(false)
    return {
      dialogVisible
    }
  }
})
</script>

<style lang="scss" scoped>
.footer-wrapper {
  background: rgba(255, 255, 255, 0.3);
  height: 32px;
  display: flex;
  .footer-item {
    flex: 1;
    font-size: 16px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: rgba($color: #fff, $alpha: .5);
    }
  }
}
</style>
