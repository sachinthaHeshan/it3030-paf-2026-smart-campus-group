package com.sliit.smartcampus.item;

/**
 * Represents a row from the items table (id: bigint, name: varchar).
 */
public record Item(Long id, String name) {}
