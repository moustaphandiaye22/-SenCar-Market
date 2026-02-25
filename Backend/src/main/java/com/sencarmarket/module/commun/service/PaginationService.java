package com.sencarmarket.module.commun.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PaginationService {

    public <T> PaginatedResponse<T> build(Page<?> page, List<T> content) {
        return PaginatedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    public <S, T> PaginatedResponse<T> map(Page<S> page, Function<S, T> mapper) {
        List<T> content = page.getContent().stream().map(mapper).collect(Collectors.toList());
        return build(page, content);
    }
}
