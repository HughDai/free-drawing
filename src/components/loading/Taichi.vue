<script lang="ts">
import { h, defineComponent } from 'vue'

export default defineComponent({
  name: 'Taichi',
  props: {
    size: {
      type: String
    }
  },
  render () {
    return h('div', {
      class: {
        taichi: true,
        [`tachi-${this.size}`]: true
      }
    })
  }
})
</script>

<style lang="scss" scoped>
$sizes: (
  large: 160,
  medium: 120,
  small: 80
);
.taichi {
  border-radius: 50%;
  background: linear-gradient(to right, #FFF 50%, #000 50%);
  animation: spin 2s linear infinite;
  &:before, &:after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    width: 50%;
    height: 50%;
    border-radius: 50%;
    border-style: solid;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  &:before {
    background-color:#000;
    border-color:#FFF;
    top: 0;
  }
  &:after {
    background-color:#FFF;
    border-color:#000;
    bottom: 0;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
@each $key, $val in $sizes {
  .tachi-#{$key} {
    width: #{$val}px;
    height: #{$val}px;
    &:before, &:after {
      border-width: calc(#{$val}px / 6);
    }
  }
}
</style>
