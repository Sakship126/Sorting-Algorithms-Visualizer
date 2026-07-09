// Sorting Algorithm Implementations
function* bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        yield { type: 'swap', indices: [j, j + 1] };
      }
    }
    yield { type: 'sorted', indices: [n - i - 1] };
  }
  yield { type: 'sorted', indices: [0] };
}

function* selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [minIndex, j] };
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      let temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
      yield { type: 'swap', indices: [i, minIndex] };
    }
    yield { type: 'sorted', indices: [i] };
  }
  yield { type: 'sorted', indices: [n - 1] };
}

function* insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      yield { type: 'compare', indices: [j - 1, j] };
      if (arr[j - 1] > arr[j]) {
        let temp = arr[j - 1];
        arr[j - 1] = arr[j];
        arr[j] = temp;
        yield { type: 'swap', indices: [j - 1, j] };
        j--;
      } else {
        break;
      }
    }
  }
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* shellSort(arr) {
  let n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j = i;
      while (j >= gap) {
        yield { type: 'compare', indices: [j - gap, j] };
        if (arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          yield { type: 'overwrite', index: j, value: arr[j] };
          j -= gap;
        } else {
          break;
        }
      }
      arr[j] = temp;
      yield { type: 'overwrite', index: j, value: arr[j] };
    }
  }
  for (let i = 0; i < n; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* cocktailSort(arr) {
  let n = arr.length;
  let start = 0;
  let end = n - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    for (let i = start; i < end; i++) {
      yield { type: 'compare', indices: [i, i + 1] };
      if (arr[i] > arr[i + 1]) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        yield { type: 'swap', indices: [i, i + 1] };
        swapped = true;
      }
    }
    yield { type: 'sorted', indices: [end] };
    end--;
    if (!swapped) break;

    swapped = false;
    for (let i = end; i > start; i--) {
      yield { type: 'compare', indices: [i - 1, i] };
      if (arr[i - 1] > arr[i]) {
        let temp = arr[i - 1];
        arr[i - 1] = arr[i];
        arr[i] = temp;
        yield { type: 'swap', indices: [i - 1, i] };
        swapped = true;
      }
    }
    yield { type: 'sorted', indices: [start] };
    start++;
  }

  for (let i = 0; i < n; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* mergeSort(arr) {
  yield* mergeSortRange(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* mergeSortRange(arr, left, right) {
  if (left >= right) return;
  let mid = Math.floor((left + right) / 2);
  yield* mergeSortRange(arr, left, mid);
  yield* mergeSortRange(arr, mid + 1, right);
  yield* merge(arr, left, mid, right);
}

function* merge(arr, left, mid, right) {
  let leftPart = arr.slice(left, mid + 1);
  let rightPart = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;

  while (i < leftPart.length && j < rightPart.length) {
    yield { type: 'compare', indices: [left + i, mid + 1 + j] };
    if (leftPart[i] <= rightPart[j]) {
      arr[k] = leftPart[i];
      i++;
    } else {
      arr[k] = rightPart[j];
      j++;
    }
    yield { type: 'overwrite', index: k, value: arr[k] };
    k++;
  }

  while (i < leftPart.length) {
    arr[k] = leftPart[i];
    yield { type: 'overwrite', index: k, value: arr[k] };
    i++; k++;
  }
  while (j < rightPart.length) {
    arr[k] = rightPart[j];
    yield { type: 'overwrite', index: k, value: arr[k] };
    j++; k++;
  }
}

function* quickSort(arr) {
  yield* quickSortRange(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* quickSortRange(arr, low, high) {
  if (low < high) {
    let pivotIndex = yield* partition(arr, low, high);
    yield* quickSortRange(arr, low, pivotIndex - 1);
    yield* quickSortRange(arr, pivotIndex + 1, high);
  }
}

function* partition(arr, low, high) {
  let pivot = arr[high]; 
  let i = low - 1;

  for (let j = low; j < high; j++) {
    yield { type: 'compare', indices: [j, high] };
    if (arr[j] < pivot) {
      i++;
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      yield { type: 'swap', indices: [i, j] };
    }
  }

  let temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  yield { type: 'swap', indices: [i + 1, high] };

  return i + 1;
}

function* heapSort(arr) {
  let n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    let temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    yield { type: 'swap', indices: [0, i] };
    yield { type: 'sorted', indices: [i] };
    yield* heapify(arr, i, 0);
  }

  yield { type: 'sorted', indices: [0] };
}

function* heapify(arr, n, rootIndex) {
  let largest = rootIndex;
  let left = 2 * rootIndex + 1;
  let right = 2 * rootIndex + 2;

  if (left < n) {
    yield { type: 'compare', indices: [left, largest] };
    if (arr[left] > arr[largest]) largest = left;
  }
  if (right < n) {
    yield { type: 'compare', indices: [right, largest] };
    if (arr[right] > arr[largest]) largest = right;
  }

  if (largest !== rootIndex) {
    let temp = arr[rootIndex];
    arr[rootIndex] = arr[largest];
    arr[largest] = temp;
    yield { type: 'swap', indices: [rootIndex, largest] };
    yield* heapify(arr, n, largest);
  }
}

function* radixSort(arr) {
  let max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    yield* countSortByDigit(arr, exp);
    exp *= 10;
  }
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'sorted', indices: [i] };
  }
}

function* countSortByDigit(arr, exp) {
  let n = arr.length;
  let output = new Array(n).fill(0);
  let count = new Array(10).fill(0);

  for (let i = 0; i < n; i++) {
    let digit = Math.floor(arr[i] / exp) % 10;
    count[digit]++;
    yield { type: 'compare', indices: [i] };
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  for (let i = n - 1; i >= 0; i--) {
    let digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }

  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
    yield { type: 'overwrite', index: i, value: arr[i] };
  }
}

// Algorithm Information
const algoInfo = {
  bubble:    { name: 'Bubble Sort',     description: 'Repeatedly compares adjacent elements and swaps them until the array is sorted.',
    stable: '✅Yes',  inplace: '✅Yes',   best: 'O(n)',       average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  selection: { name: 'Selection Sort',  description: "Repeatedly finds the smallest element from the unsorted portion and places it at its correct position.",
    stable: "❌No", inplace: "✅Yes", best: 'O(n²)',     average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  insertion: { name: 'Insertion Sort',  description: "Builds the sorted array one element at a time by inserting each element into its correct position.",
    stable: "✅Yes", inplace: "✅Yes", best: 'O(n)',       average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  shell:     { name: 'Shell Sort',     description: "An optimized version of insertion sort that compares elements separated by a decreasing gap sequence.",
    stable: "❌No", inplace: "✅Yes",  best: 'O(n log n)', average: 'O(n¹·³)',   worst: 'O(n²)',     space: 'O(1)' },
  cocktail:  { name: 'Cocktail Shaker',  description: "A bidirectional variation of Bubble Sort that alternates between left-to-right and right-to-left passes.",
    stable: "✅Yes",inplace: "✅Yes",  best: 'O(n)',       average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  merge:     { name: 'Merge Sort',   description: "Uses the divide-and-conquer technique by recursively splitting the array and merging sorted subarrays.",
    stable: "✅Yes",inplace: "❌No",   best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  quick:     { name: 'Quick Sort',    description: "Partitions the array around a pivot and recursively sorts the smaller subarrays for high average performance.",
    stable: "❌No",inplace: "✅Yes",  best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)',     space: 'O(log n)' },
  heap:      { name: 'Heap Sort',      description: "Builds a max heap and repeatedly extracts the largest element to produce a sorted array.",
    stable: "❌No",inplace: "✅Yes", best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  radix:     { name: 'Radix Sort',      description: "Sorts integers digit by digit using a stable counting sort instead of direct element comparisons.",
    stable: "✅Yes",inplace: "❌No", best: 'O(nk)',      average: 'O(nk)',      worst: 'O(nk)',      space: 'O(n+k)' },
};

// Algorithm Registry
const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  shell: shellSort,
  cocktail: cocktailSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
  radix: radixSort,
};