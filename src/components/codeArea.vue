<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const { modelValue } = toRefs(props);

const clearText = () => {
  emit('update:modelValue', '');
};

</script>

<template>
      <div f-c>
        <div h-50px fe>
          <button @click="clearText" class="nes-btn is-normal h-40px w-40px !fcc">X</button>
        </div>
        <textarea
        v-model="modelValue"
        class="nes-textarea !w-500px h-900px font-sans"
      ></textarea>
      </div>
</template>
